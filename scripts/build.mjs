import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const HIDDEN_PREFIX = "_private_";
const GLSL_MARKER = "/* glsl */";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const configPath = path.join(projectRoot, "tsconfig.json");

const formatHost = {
  getCanonicalFileName: (fileName) => fileName,
  getCurrentDirectory: () => projectRoot,
  getNewLine: () => ts.sys.newLine,
};

function fail(diagnostics) {
  process.stderr.write(ts.formatDiagnosticsWithColorAndContext(diagnostics, formatHost));
  process.exit(1);
}

const parsedConfig = ts.getParsedCommandLineOfConfigFile(
  configPath,
  {},
  { ...ts.sys, onUnRecoverableConfigFileDiagnostic: (diagnostic) => fail([diagnostic]) },
);
if (parsedConfig.errors.length > 0) {
  fail(parsedConfig.errors);
}

const program = ts.createProgram({
  rootNames: parsedConfig.fileNames,
  options: parsedConfig.options,
});
const checker = program.getTypeChecker();

const typeErrors = ts.getPreEmitDiagnostics(program);
if (typeErrors.length > 0) {
  fail(typeErrors);
}

/** With `stripInternal` the declarations hide `@internal` members, so no other package names them. */
const hidesInternalMembers = parsedConfig.options.stripInternal === true;

const projectFiles = program
  .getSourceFiles()
  .filter(
    (sourceFile) =>
      !sourceFile.isDeclarationFile && !program.isSourceFileFromExternalLibrary(sourceFile),
  );

const problems = [];

/** Declarations emitted under a new name, and the symbols read under one, for checkRenames */
const renamedDeclarations = new Set();
const renamedReferences = new Map();

function report(node, message) {
  const sourceFile = node.getSourceFile();
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  const file = path.relative(projectRoot, sourceFile.fileName);
  problems.push(`${file}:${line + 1}:${character + 1} - ${message}`);
}

function isClassMember(node) {
  return (
    ts.isPropertyDeclaration(node) ||
    ts.isMethodDeclaration(node) ||
    ts.isGetAccessorDeclaration(node) ||
    ts.isSetAccessorDeclaration(node)
  );
}

function isTaggedInternal(declaration) {
  return ts.getJSDocTags(declaration).some((tag) => tag.tagName.text === "internal");
}

/** Members marked @internal that keep their names, see exposeAliasedMembers */
const exposedDeclarations = new Set();

function isPrivate(declaration) {
  return (ts.getCombinedModifierFlags(declaration) & ts.ModifierFlags.Private) !== 0;
}

/** True for a member of a class of this project that code outside the project cannot name. */
function isHiddenDeclaration(declaration) {
  if (declaration.getSourceFile().isDeclarationFile) {
    return false;
  }
  if (isPrivate(declaration)) {
    return true;
  }
  return (
    hidesInternalMembers &&
    isClassMember(declaration) &&
    isTaggedInternal(declaration) &&
    !exposedDeclarations.has(declaration)
  );
}

function countHiddenDeclarations(symbol) {
  return (symbol?.declarations ?? []).filter(isHiddenDeclaration).length;
}

function isHiddenMember(symbol) {
  const count = countHiddenDeclarations(symbol);
  return count > 0 && count === symbol.declarations.length;
}

/** True when the symbol joins members of several types, some of them hidden and some not. */
function isPartlyHidden(symbol) {
  const count = countHiddenDeclarations(symbol);
  return count > 0 && count < symbol.declarations.length;
}

/**
 * Makes the hidden declarations of the symbol keep their names.
 * @returns True if a declaration changed
 */
function expose(symbol) {
  let changed = false;
  for (const declaration of symbol.declarations ?? []) {
    if (isHiddenDeclaration(declaration) && !isPrivate(declaration)) {
      exposedDeclarations.add(declaration);
      changed = true;
    }
  }
  return changed;
}

function isClassMemberName(node) {
  return isClassMember(node.parent) && node.parent.name === node;
}

/** Text of a member name written as an identifier or as a string, `["name"]` included. */
function getStaticName(name) {
  if (ts.isIdentifier(name) || ts.isStringLiteralLike(name)) {
    return name.text;
  }
  if (ts.isComputedPropertyName(name) && ts.isStringLiteralLike(name.expression)) {
    return name.expression.text;
  }
  return undefined;
}

/** The class member a string names, as `"name"() {}` or `["name"]() {}` does. */
function getMemberNamedByString(literal) {
  const name = ts.isComputedPropertyName(literal.parent) ? literal.parent : literal;
  return isClassMemberName(name) ? name.parent : undefined;
}

function isPropertyAccessName(node) {
  return ts.isPropertyAccessExpression(node.parent) && node.parent.name === node;
}

function isBindingPropertyName(node) {
  return ts.isBindingElement(node.parent) && node.parent.propertyName === node;
}

function isElementAccessArgument(node) {
  return ts.isElementAccessExpression(node.parent) && node.parent.argumentExpression === node;
}

/**
 * A `private` parameter property declares a parameter and a class property under one name, and
 * the emitted constructor assigns one to the other by that name. Both are renamed together.
 */
function isParameterProperty(symbol) {
  return symbol.declarations.every((declaration) => ts.isParameter(declaration));
}

/** True when the object or array literal is written to, as in `({ a, b } = source)`. */
function isAssignmentPattern(literal) {
  const parent = literal.parent;
  if (ts.isBinaryExpression(parent)) {
    return parent.operatorToken.kind === ts.SyntaxKind.EqualsToken && parent.left === literal;
  }
  if (ts.isForOfStatement(parent) || ts.isForInStatement(parent)) {
    return parent.initializer === literal;
  }
  if (ts.isPropertyAssignment(parent)) {
    return parent.initializer === literal && isAssignmentPattern(parent.parent);
  }
  if (
    ts.isArrayLiteralExpression(parent) ||
    ts.isSpreadElement(parent) ||
    ts.isSpreadAssignment(parent) ||
    ts.isParenthesizedExpression(parent)
  ) {
    return isAssignmentPattern(parent);
  }
  return false;
}

/**
 * Calls back for every instance member of the class that a base class or an implemented
 * interface declares too, with the symbols of both.
 */
function forEachInheritedMember(classNode, callback) {
  const classSymbol = classNode.name && checker.getSymbolAtLocation(classNode.name);
  if (classSymbol === undefined) {
    return;
  }
  const relatedTypes = [
    ...checker.getBaseTypes(checker.getDeclaredTypeOfSymbol(classSymbol)),
    ...(classNode.heritageClauses ?? [])
      .filter((clause) => clause.token === ts.SyntaxKind.ImplementsKeyword)
      .flatMap((clause) => clause.types)
      .map((element) => checker.getTypeAtLocation(element)),
  ];
  for (const member of classNode.members) {
    if (!isClassMember(member) || ts.isStatic(member)) {
      continue;
    }
    const name = getStaticName(member.name);
    const own = checker.getSymbolAtLocation(member.name);
    if (name === undefined || own === undefined) {
      continue;
    }
    for (const relatedType of relatedTypes) {
      const inherited = checker.getPropertyOfType(relatedType, name);
      if (inherited !== undefined) {
        callback(member, own, inherited);
      }
    }
  }
}

/**
 * An `@internal` member is still public for the type checker, so the object holding it can be
 * read under the plain name in three ways: through an interface the class fits, through an
 * override or a base member that is not hidden, and through a union with a type whose member
 * is not hidden. Such members keep their names.
 */
function exposeAliasedMembers() {
  const classNodes = [];
  const signatures = [];
  const accessedNames = [];

  function collect(node) {
    if (ts.isClassLike(node) && node.name !== undefined) {
      classNodes.push(node);
    }
    if (ts.isPropertySignature(node) || ts.isMethodSignature(node)) {
      signatures.push(node);
    }
    if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.name)) {
      accessedNames.push(node.name);
    }
    if (ts.isElementAccessExpression(node) && ts.isStringLiteralLike(node.argumentExpression)) {
      accessedNames.push(node.argumentExpression);
    }
    ts.forEachChild(node, collect);
  }
  projectFiles.forEach(collect);

  const classTypes = classNodes.map((classNode) =>
    checker.getDeclaredTypeOfSymbol(checker.getSymbolAtLocation(classNode.name)),
  );
  for (const signature of signatures) {
    const name = getStaticName(signature.name);
    if (name === undefined) {
      continue;
    }
    const signatureOwner = checker.getTypeAtLocation(signature.parent);
    for (const classType of classTypes) {
      const member = checker.getPropertyOfType(classType, name);
      if (
        member !== undefined &&
        isHiddenMember(member) &&
        checker.isTypeAssignableTo(classType, signatureOwner)
      ) {
        expose(member);
      }
    }
  }

  let changed = true;
  while (changed) {
    changed = false;
    for (const classNode of classNodes) {
      forEachInheritedMember(classNode, (member, own, inherited) => {
        if (isHiddenMember(own) !== isHiddenMember(inherited)) {
          changed = expose(own) || changed;
          changed = expose(inherited) || changed;
        }
      });
    }
    for (const name of accessedNames) {
      const symbol = checker.getSymbolAtLocation(name);
      if (symbol !== undefined && isPartlyHidden(symbol)) {
        changed = expose(symbol) || changed;
      }
    }
  }
}

/** Reports a member hidden in one class of a hierarchy and visible in another. */
function checkInheritedMembers(classNode) {
  forEachInheritedMember(classNode, (member, own, inherited) => {
    if (isHiddenMember(own) !== isHiddenMember(inherited)) {
      report(member.name, `"${own.name}" is hidden in one class and visible in another`);
    }
  });
}

function endsWithWordCharacter(text) {
  return /\w$/.test(text);
}

function startsWithWordCharacter(text) {
  return /^\w/.test(text);
}

/** Two lines need a line break between them when joining would merge or create a token. */
function needsLineBreak(previous, next) {
  if (previous.startsWith("#") || next.startsWith("#")) {
    return true;
  }
  if (endsWithWordCharacter(previous) && startsWithWordCharacter(next)) {
    return true;
  }
  return /[+\-/]$/.test(previous) && /^[+\-/*]/.test(next);
}

function minifyGLSLLine(line) {
  const code = line.replace(/\/\/.*$/, "").trim();
  if (code.startsWith("#")) {
    return code.replace(/[ \t]+/g, " ");
  }
  return code
    .replace(/[ \t]+/g, " ")
    .replace(/ ?([{}()[\];,=*/<>?:!&|^%]) ?/g, "$1")
    .replace(/ ([+-])/g, (match, sign, offset, text) => (text[offset - 1] === sign ? match : sign))
    .replace(/([+-]) /g, (match, sign, offset, text) => (text[offset + 2] === sign ? match : sign));
}

/**
 * Removes comments, indentation and optional spaces from a piece of GLSL. A line cut by a
 * template substitution stays as written, since its other half is not known here.
 */
function minifyGLSL(text, continuesBefore, continuesAfter) {
  const lines = text.replace(/\/\*[\s\S]*?\*\//g, "").split("\n");
  const lastIndex = lines.length - 1;
  const pieces = [];

  lines.forEach((line, index) => {
    const cutBefore = continuesBefore && index === 0;
    const cutAfter = continuesAfter && index === lastIndex;
    if (cutBefore) {
      pieces.push({ text: line, fixed: true });
    } else if (cutAfter) {
      pieces.push({ text: line.trimStart(), fixed: true });
    } else {
      const minified = minifyGLSLLine(line);
      if (minified !== "") {
        pieces.push({ text: minified, fixed: false });
      }
    }
  });

  let result = "";
  pieces.forEach((piece, index) => {
    if (index > 0) {
      const previous = pieces[index - 1];
      const breaks = previous.fixed || piece.fixed || needsLineBreak(previous.text, piece.text);
      result += breaks ? "\n" : "";
    }
    result += piece.text;
  });

  const startsOnNewLine = !continuesBefore && /^\s*\n/.test(text);
  const endsWithNewLine = !continuesAfter && /\n\s*$/.test(text);
  return (startsOnNewLine ? "\n" : "") + result + (endsWithNewLine && result !== "" ? "\n" : "");
}

/**
 * Emits every hidden class member, and every reference to it, with HIDDEN_PREFIX, and minifies
 * the template literals marked with GLSL_MARKER.
 */
function shrinkOutput(context) {
  const { factory } = context;

  function createRenamed(identifier) {
    return ts.setTextRange(factory.createIdentifier(HIDDEN_PREFIX + identifier.text), identifier);
  }

  /** True when the member is hidden in every type the node reads it through. */
  function isRenamed(node, symbol) {
    if (symbol === undefined || countHiddenDeclarations(symbol) === 0) {
      return false;
    }
    if (isPartlyHidden(symbol)) {
      const owners = new Set(symbol.declarations.map((declaration) => declaration.parent));
      if (owners.size > 1) {
        report(node, `"${symbol.name}" is hidden in some of the types it is read through`);
      }
      return false;
    }
    return true;
  }

  function visitIdentifier(node) {
    const symbol = checker.getSymbolAtLocation(node);
    if (!isRenamed(node, symbol)) {
      return node;
    }
    if (isClassMemberName(node) || (ts.isParameter(node.parent) && node.parent.name === node)) {
      renamedDeclarations.add(node.parent);
      return createRenamed(node);
    }
    if (isPropertyAccessName(node) || isBindingPropertyName(node) || isParameterProperty(symbol)) {
      renamedReferences.set(symbol, node);
      return createRenamed(node);
    }
    report(node, `hidden member "${node.text}" is referenced in a form the build cannot rename`);
    return node;
  }

  function visitString(node) {
    const member = getMemberNamedByString(node);
    if (member !== undefined) {
      if (!isRenamed(node, checker.getSymbolAtLocation(member.name))) {
        return node;
      }
      renamedDeclarations.add(member);
      return factory.createStringLiteral(HIDDEN_PREFIX + node.text);
    }
    if (isElementAccessArgument(node)) {
      const symbol = checker.getSymbolAtLocation(node);
      if (!isRenamed(node, symbol)) {
        return node;
      }
      renamedReferences.set(symbol, node);
      return factory.createStringLiteral(HIDDEN_PREFIX + node.text);
    }
    return node;
  }

  function visitShorthandBinding(node) {
    const sourceType = checker.getApparentType(checker.getTypeAtLocation(node.parent));
    const symbol = checker.getPropertyOfType(sourceType, node.name.text);
    if (!isRenamed(node.name, symbol)) {
      return ts.visitEachChild(node, visit, context);
    }
    renamedReferences.set(symbol, node.name);
    return factory.updateBindingElement(
      node,
      node.dotDotDotToken,
      createRenamed(node.name),
      node.name,
      ts.visitNode(node.initializer, visit),
    );
  }

  function visitShorthandProperty(node) {
    if (isAssignmentPattern(node.parent)) {
      if (isHiddenMember(checker.getPropertySymbolOfDestructuringAssignment(node.name))) {
        report(node.name, `hidden member "${node.name.text}" is assigned by destructuring`);
      }
      return node;
    }
    const valueSymbol = checker.getShorthandAssignmentValueSymbol(node);
    if (isHiddenMember(valueSymbol) && isParameterProperty(valueSymbol)) {
      return factory.createPropertyAssignment(
        factory.createIdentifier(node.name.text),
        createRenamed(node.name),
      );
    }
    return node;
  }

  function isMarkedGLSL(node) {
    const sourceFile = node.getSourceFile();
    return sourceFile.text
      .slice(node.getFullStart(), node.getStart(sourceFile))
      .includes(GLSL_MARKER);
  }

  function visitGLSLTemplate(node) {
    if (ts.isNoSubstitutionTemplateLiteral(node)) {
      return factory.createNoSubstitutionTemplateLiteral(minifyGLSL(node.text, false, false));
    }
    const lastIndex = node.templateSpans.length - 1;
    return factory.updateTemplateExpression(
      node,
      factory.createTemplateHead(minifyGLSL(node.head.text, false, true)),
      node.templateSpans.map((span, index) =>
        factory.updateTemplateSpan(
          span,
          ts.visitNode(span.expression, visit),
          index === lastIndex
            ? factory.createTemplateTail(minifyGLSL(span.literal.text, true, false))
            : factory.createTemplateMiddle(minifyGLSL(span.literal.text, true, true)),
        ),
      ),
    );
  }

  function visit(node) {
    if (ts.isIdentifier(node)) {
      return visitIdentifier(node);
    }
    if (
      (ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateExpression(node)) &&
      isMarkedGLSL(node)
    ) {
      return visitGLSLTemplate(node);
    }
    if (ts.isStringLiteralLike(node)) {
      return visitString(node);
    }
    if (
      ts.isBindingElement(node) &&
      ts.isObjectBindingPattern(node.parent) &&
      node.propertyName === undefined &&
      ts.isIdentifier(node.name)
    ) {
      return visitShorthandBinding(node);
    }
    if (ts.isShorthandPropertyAssignment(node)) {
      return visitShorthandProperty(node);
    }
    /* Types are erased from the output, and a type can name a hidden member without reading it */
    if (
      (ts.isTypeNode(node) && !ts.isExpressionWithTypeArguments(node)) ||
      ts.isInterfaceDeclaration(node) ||
      ts.isTypeAliasDeclaration(node)
    ) {
      return node;
    }
    if (ts.isClassLike(node)) {
      checkInheritedMembers(node);
    }
    return ts.visitEachChild(node, visit, context);
  }

  return (sourceFile) => ts.visitNode(sourceFile, visit);
}

/** Reports a member read under its new name while one of its declarations kept the old one. */
function checkRenames() {
  for (const symbol of renamedReferences.keys()) {
    for (const declaration of symbol.declarations) {
      if (!renamedDeclarations.has(declaration)) {
        report(
          declaration,
          `hidden member "${symbol.name}" is declared in a form the build cannot rename`,
        );
      }
    }
  }
}

if (hidesInternalMembers) {
  exposeAliasedMembers();
}

const outputs = [];
const emitResult = program.emit(
  undefined,
  (fileName, text) => outputs.push({ fileName, text }),
  undefined,
  false,
  { before: [shrinkOutput] },
);
if (emitResult.diagnostics.length > 0) {
  fail(emitResult.diagnostics);
}
checkRenames();
if (problems.length > 0) {
  process.stderr.write(`${[...new Set(problems)].join("\n")}\n`);
  process.exit(1);
}

for (const { fileName, text } of outputs) {
  fs.mkdirSync(path.dirname(fileName), { recursive: true });
  fs.writeFileSync(fileName, text);
}

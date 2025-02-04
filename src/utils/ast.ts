import * as ESTree from 'estree';

export function getNodeName(node: ESTree.Node) {
  return node.type === 'Identifier' ? node.name : undefined;
}

export function isIdentifier(node: ESTree.Node, name: string) {
  return getNodeName(node) === name;
}

export function isObject(node: ESTree.CallExpression, name: string) {
  return (
    node.callee.type === 'MemberExpression' &&
    isIdentifier(node.callee.object, name)
  );
}

export function isCalleeProperty(node: ESTree.CallExpression, name: string) {
  return (
    node.callee.type === 'MemberExpression' &&
    isIdentifier(node.callee.property, name)
  );
}

export function isTestIdentifier(node: ESTree.Node) {
  return (
    isIdentifier(node, 'test') ||
    (node.type === 'MemberExpression' && isIdentifier(node.object, 'test'))
  );
}

export function isObjectProperty(node: ESTree.MemberExpression, name: string) {
  return (
    node.object.type === 'MemberExpression' &&
    isIdentifier(node.object.property, name)
  );
}

function isLiteral<T>(node: ESTree.Node, type: string, value?: T) {
  return (
    node.type === 'Literal' &&
    (value === undefined
      ? typeof node.value === type
      : (node.value as any) === value)
  );
}

export function isStringLiteral(node: ESTree.Node, value?: string) {
  return isLiteral(node, 'string', value);
}

export function isBooleanLiteral(node: ESTree.Node, value?: boolean) {
  return isLiteral(node, 'boolean', value);
}

function isDescribeAlias(node: ESTree.Node) {
  return isIdentifier(node, 'describe');
}

function isDescribeProperty(node: ESTree.Node) {
  const describeProperties = ['parallel', 'serial', 'only', 'skip'];
  return describeProperties.some((prop) => isIdentifier(node, prop));
}

export function isDescribeCall(node: ESTree.CallExpression) {
  if (isIdentifier(node.callee, 'describe')) {
    return true;
  }

  const callee =
    node.callee.type === 'TaggedTemplateExpression'
      ? node.callee.tag
      : node.callee.type === 'CallExpression'
      ? node.callee.callee
      : node.callee;

  if (callee.type === 'MemberExpression' && isDescribeAlias(callee.property)) {
    return true;
  }

  if (
    callee.type === 'MemberExpression' &&
    isDescribeProperty(callee.property)
  ) {
    return callee.object.type === 'MemberExpression'
      ? callee.object.object.type === 'MemberExpression'
        ? isDescribeAlias(callee.object.object.property)
        : isDescribeAlias(callee.object.property)
      : isDescribeAlias(callee.property) || isDescribeAlias(callee.object);
  }

  return false;
}

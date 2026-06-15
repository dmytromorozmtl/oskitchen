/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Require userId or workspaceId in Prisma where clauses (tenant isolation)",
    },
    messages: {
      missingScope:
        "Prisma query must include userId or workspaceId in `where` (or use scopedIdWhere / buildOwnerScopedWhere).",
    },
    schema: [],
  },
  create(context) {
    const PRISMA_READS = new Set([
      "findUnique",
      "findFirst",
      "findMany",
      "update",
      "updateMany",
      "delete",
      "deleteMany",
    ]);

    function whereHasOwnerScope(whereNode) {
      if (!whereNode || whereNode.type !== "ObjectExpression") return false;
      return whereNode.properties.some((prop) => {
        if (prop.type !== "Property") return false;
        const key = prop.key;
        if (key.type === "Identifier") {
          return key.name === "userId" || key.name === "workspaceId";
        }
        if (key.type === "Literal" && typeof key.value === "string") {
          return key.value === "userId" || key.value === "workspaceId";
        }
        return false;
      });
    }

    return {
      CallExpression(node) {
        if (node.callee.type !== "MemberExpression") return;
        const obj = node.callee.object;
        const prop = node.callee.property;
        if (obj.type !== "MemberExpression") return;
        if (obj.object.type !== "Identifier" || obj.object.name !== "prisma") return;
        if (prop.type !== "Identifier" || !PRISMA_READS.has(prop.name)) return;

        const args = node.arguments[0];
        if (!args || args.type !== "ObjectExpression") return;

        const whereProp = args.properties.find(
          (p) =>
            p.type === "Property" &&
            ((p.key.type === "Identifier" && p.key.name === "where") ||
              (p.key.type === "Literal" && p.key.value === "where")),
        );
        if (!whereProp || whereProp.type !== "Property") {
          context.report({ node, messageId: "missingScope" });
          return;
        }
        if (!whereHasOwnerScope(whereProp.value)) {
          context.report({ node, messageId: "missingScope" });
        }
      },
    };
  },
};

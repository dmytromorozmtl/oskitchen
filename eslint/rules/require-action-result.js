/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Prefer ActionResult (ok/fail) over legacy { success: true|false } in actions/",
    },
    messages: {
      legacySuccess:
        "Use ok() / fail() from @/lib/action-result instead of `{ success: true|false }`.",
    },
    schema: [],
  },
  create(context) {
    return {
      ReturnStatement(node) {
        if (!context.filename.includes("/actions/")) return;
        const arg = node.argument;
        if (!arg || arg.type !== "ObjectExpression") return;
        const legacy = arg.properties.some(
          (p) =>
            p.type === "Property" &&
            p.key.type === "Identifier" &&
            p.key.name === "success",
        );
        if (legacy) {
          context.report({ node, messageId: "legacySuccess" });
        }
      },
    };
  },
};

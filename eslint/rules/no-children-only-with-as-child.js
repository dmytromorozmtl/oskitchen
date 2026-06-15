/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Require exactly one element child when Button (or Radix Slot) uses asChild",
    },
    messages: {
      noChild:
        "`asChild` requires exactly one element child; none was found.",
      textOnly:
        "`asChild` requires a single element child, not bare text.",
      multipleChildren:
        "`asChild` accepts only one element child; wrap content in a single element (e.g. Link or span).",
      fragmentMultiple:
        "`asChild` fragment child must contain exactly one element.",
    },
    schema: [
      {
        type: "object",
        properties: {
          components: {
            type: "array",
            items: { type: "string" },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const options = context.options[0] ?? {};
    const components = new Set(options.components ?? ["Button"]);

    function isWhitespaceJsxText(node) {
      return node.type === "JSXText" && node.value.trim().length === 0;
    }

    function meaningfulChildren(children) {
      return children.filter((child) => !isWhitespaceJsxText(child));
    }

    function hasAsChildAttribute(attributes) {
      return attributes.some((attr) => {
        if (attr.type !== "JSXAttribute") return false;
        if (attr.name.type !== "JSXIdentifier" || attr.name.name !== "asChild") {
          return false;
        }
        if (attr.value == null) return true;
        if (attr.value.type === "JSXExpressionContainer") {
          const expr = attr.value.expression;
          return expr.type === "Literal" && expr.value === true;
        }
        return false;
      });
    }

    function reportFragmentChildren(fragment, node) {
      const inner = meaningfulChildren(fragment.children);
      if (inner.length === 0) {
        context.report({ node, messageId: "noChild" });
        return;
      }
      if (inner.length > 1 || inner[0].type === "JSXText") {
        context.report({ node, messageId: "fragmentMultiple" });
      }
    }

    function validateAsChildChildren(node) {
      const children = meaningfulChildren(node.children);
      if (children.length === 0) {
        context.report({ node, messageId: "noChild" });
        return;
      }
      if (children.length > 1) {
        context.report({ node, messageId: "multipleChildren" });
        return;
      }

      const only = children[0];
      if (only.type === "JSXText") {
        context.report({ node, messageId: "textOnly" });
        return;
      }
      if (only.type === "JSXFragment") {
        reportFragmentChildren(only, node);
      }
    }

    return {
      JSXOpeningElement(opening) {
        if (opening.name.type !== "JSXIdentifier") return;
        if (!components.has(opening.name.name)) return;
        if (!hasAsChildAttribute(opening.attributes)) return;

        const element = opening.parent;
        if (!element || element.type !== "JSXElement") return;
        validateAsChildChildren(element);
      },
    };
  },
};

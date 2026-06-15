import { RuleTester } from "eslint";
import { describe, it } from "vitest";

import rule from "../../eslint/rules/no-children-only-with-as-child.js";

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
  },
});

describe("react/no-children-only-with-as-child", () => {
  it("passes eslint rule tests", () => {
    ruleTester.run("react/no-children-only-with-as-child", rule, {
      valid: [
        "<Button asChild><Link href='/'>Home</Link></Button>",
        "<Button asChild><a href='/'>Home</a></Button>",
        "<Button asChild><Link href='/'> <Icon /> Home </Link></Button>",
        "<Button><Link href='/'>Home</Link><span>Extra</span></Button>",
        "<Button asChild={false}><span>A</span><span>B</span></Button>",
      ],
      invalid: [
        {
          code: "<Button asChild><Link href='/'>A</Link><span>B</span></Button>",
          errors: [{ messageId: "multipleChildren" }],
        },
        {
          code: "<Button asChild>Click me</Button>",
          errors: [{ messageId: "textOnly" }],
        },
        {
          code: "<Button asChild></Button>",
          errors: [{ messageId: "noChild" }],
        },
        {
          code: "<Button asChild><><Link href='/'>A</Link><span>B</span></></Button>",
          errors: [{ messageId: "fragmentMultiple" }],
        },
      ],
    });
  });
});

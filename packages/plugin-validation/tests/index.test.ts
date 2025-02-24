import { execute } from 'graphql';
import { gql } from 'graphql-tag';
import schema from './example/schema';

describe('validation', () => {
  it('valid query', async () => {
    const query = gql`
      query {
        exampleField(
          odd: 1
          recursive: { float: 1.1, number: 2, recurse: { float: 1.1, number: 1 } }
          contactInfo: {
            name: "Michael"
            email: "michael@test.com"
            phone: "555-123-4567"
            aliases: ["Hayes", "MHayes"]
          }
          enum1: [One, Two]
        )
      }
    `;

    const result = await execute({
      schema,
      document: query,
      contextValue: {},
    });

    expect(result).toMatchInlineSnapshot(`
      Object {
        "data": Object {
          "exampleField": 1,
        },
      }
    `);
  });

  it('invalid query', async () => {
    const query = gql`
      query {
        exampleField(
          odd: 2
          recursive: {
            float: 1
            number: 2
            recurse: { float: 1, number: 6, recurse: { float: 1.1, number: 3 } }
          }
          contactInfo: {
            name: "michael"
            email: "michael@example.com"
            phone: "555-123-456"
            aliases: ["hayes"]
          }
          enum1: [Two, One]
        )
      }
    `;

    const result = await execute({
      schema,
      document: query,
      contextValue: {},
    });

    expect(result).toMatchInlineSnapshot(`
      Object {
        "data": null,
        "errors": Array [
          [GraphQLError: [
        {
          "code": "too_big",
          "maximum": 5,
          "type": "number",
          "inclusive": true,
          "message": "Number must be less than or equal to 5",
          "path": [
            "recursive",
            "recurse",
            "number"
          ]
        },
        {
          "code": "custom",
          "message": "Invalid input",
          "path": [
            "recursive",
            "float"
          ]
        },
        {
          "code": "custom",
          "message": "Invalid input",
          "path": [
            "recursive",
            "recurse",
            "float"
          ]
        },
        {
          "code": "custom",
          "message": "number must be odd",
          "path": [
            "odd"
          ]
        },
        {
          "code": "custom",
          "message": "no example.com email addresses",
          "path": [
            "contactInfo",
            "email"
          ]
        },
        {
          "code": "custom",
          "message": "Invalid input",
          "path": [
            "enum1"
          ]
        },
        {
          "code": "too_small",
          "minimum": 12,
          "type": "string",
          "inclusive": true,
          "message": "String must contain at least 12 character(s)",
          "path": [
            "contactInfo",
            "phone"
          ]
        },
        {
          "validation": "regex",
          "code": "invalid_string",
          "message": "Invalid",
          "path": [
            "contactInfo",
            "phone"
          ]
        },
        {
          "code": "custom",
          "message": "Aliases should be capitalized",
          "path": [
            "contactInfo",
            "aliases"
          ]
        },
        {
          "code": "custom",
          "message": "Name should be capitalized",
          "path": [
            "contactInfo",
            "name"
          ]
        },
        {
          "code": "custom",
          "message": "number must not be 3",
          "path": [
            "recursive",
            "recurse",
            "recurse"
          ]
        },
        {
          "code": "custom",
          "path": [
            "contactInfo",
            "aliases"
          ],
          "message": "contactInfo should include at least 2 aliases"
        }
      ]],
        ],
      }
    `);
  });

  it('example queries', async () => {
    const query = gql`
      query {
        simpleValid: simple(email: "abc@def.com")
        simpleInvalid: simple(email: "abc")
        simpleInvalid2: simple
        messageValid: withMessage(email: "abc@def.com")
        messageInvalid: withMessage(email: "abc")
        messageInvalid2: withMessage
        listValid: list(list: ["abc", "def", "ghi"])
        listInvalid: list(list: ["abcdef", "ghi"])
        listInvalid2: list(list: ["a", "b", "c", "d"])
      }
    `;

    const result = await execute({
      schema,
      document: query,
      contextValue: {},
    });

    expect(result).toMatchInlineSnapshot(`
      Object {
        "data": Object {
          "listInvalid": null,
          "listInvalid2": null,
          "listValid": true,
          "messageInvalid": null,
          "messageInvalid2": null,
          "messageValid": true,
          "simpleInvalid": null,
          "simpleInvalid2": null,
          "simpleValid": true,
        },
        "errors": Array [
          [GraphQLError: [
        {
          "validation": "email",
          "code": "invalid_string",
          "message": "invalid email address",
          "path": [
            "email"
          ]
        }
      ]],
          [GraphQLError: [
        {
          "code": "custom",
          "message": "Must provide either phone number or email address",
          "path": []
        }
      ]],
          [GraphQLError: [
        {
          "code": "too_big",
          "maximum": 3,
          "type": "string",
          "inclusive": true,
          "message": "String must contain at most 3 character(s)",
          "path": [
            "list",
            0
          ]
        }
      ]],
          [GraphQLError: [
        {
          "code": "too_big",
          "maximum": 3,
          "type": "array",
          "inclusive": true,
          "message": "Array must contain at most 3 element(s)",
          "path": [
            "list"
          ]
        }
      ]],
          [GraphQLError: [
        {
          "validation": "email",
          "code": "invalid_string",
          "message": "Invalid email",
          "path": [
            "email"
          ]
        }
      ]],
          [GraphQLError: [
        {
          "code": "custom",
          "message": "Invalid input",
          "path": []
        }
      ]],
        ],
      }
    `);
  });

  it('input object with schema', async () => {
    const query = gql`
      query {
        invalid: soloNested(input: { nested: { id: "1" } })
        valid: soloNested(input: { nested: { id: "12" } })
        invalidList: nestedObjectList(input: { nested: [{ id: "1" }] })
        validList: nestedObjectList(input: { nested: [{ id: "12" }] })
      }
    `;

    const result = await execute({
      schema,
      document: query,
      contextValue: {},
    });

    expect(result).toMatchInlineSnapshot(`
      Object {
        "data": Object {
          "invalid": null,
          "invalidList": null,
          "valid": true,
          "validList": true,
        },
        "errors": Array [
          [GraphQLError: [
        {
          "code": "too_small",
          "minimum": 2,
          "type": "string",
          "inclusive": true,
          "message": "String must contain at least 2 character(s)",
          "path": [
            0,
            "id"
          ]
        }
      ]],
          [GraphQLError: [
        {
          "code": "too_small",
          "minimum": 2,
          "type": "string",
          "inclusive": true,
          "message": "String must contain at least 2 character(s)",
          "path": [
            "input",
            "nested",
            "id"
          ]
        }
      ]],
        ],
      }
    `);
  });
  it('input object with input', async () => {
    const query = gql`
      query {
        withValidationInput(input: { name: "secret", age: 100 })
        withValidationInputInvalid: withValidationInput(input: { name: "not secret", age: 101 })
        withValidationInputInvalid2: withValidationInput(input: { name: "not secret", age: 100 })
        withValidationInputInvalid3: withValidationInput(input: { name: "secret", age: 101 })
        withValidationAndFieldValidator(input: { name: "secret", age: 100 })
        withValidationAndFieldValidatorInvalid: withValidationAndFieldValidator(
          input: { name: "not secret", age: 101 }
        )
      }
    `;

    const result = await execute({
      schema,
      document: query,
      contextValue: {},
    });

    expect(result).toMatchInlineSnapshot(`
      Object {
        "data": Object {
          "withValidationAndFieldValidator": true,
          "withValidationAndFieldValidatorInvalid": null,
          "withValidationInput": true,
          "withValidationInputInvalid": null,
          "withValidationInputInvalid2": null,
          "withValidationInputInvalid3": null,
        },
        "errors": Array [
          [GraphQLError: [
        {
          "code": "custom",
          "message": "Incorrect name given",
          "path": [
            "input"
          ]
        },
        {
          "code": "custom",
          "message": "Incorrect age given",
          "path": [
            "input"
          ]
        }
      ]],
          [GraphQLError: [
        {
          "code": "custom",
          "message": "Incorrect name given",
          "path": [
            "input"
          ]
        }
      ]],
          [GraphQLError: [
        {
          "code": "custom",
          "message": "Incorrect age given",
          "path": [
            "input"
          ]
        }
      ]],
          [GraphQLError: [
        {
          "code": "custom",
          "message": "Incorrect name given",
          "path": [
            "input"
          ]
        },
        {
          "code": "custom",
          "message": "Incorrect age given",
          "path": [
            "input"
          ]
        }
      ]],
        ],
      }
    `);
  });
});

const validate = require("validate.js");
const common = require("../common");

module.exports = {
  ...common,
  key: "sendgrid-list-global-supressions",
  name: "List Global Supressions",
  description:
    "Allows you to get a list of all email address that are globally suppressed.",
  version: "0.0.47",
  type: "action",
  props: {
    ...common.props,
    startTime: {
      type: "integer",
      label: "Start Time",
      description:
        "Refers start of the time range in unix timestamp when an unsubscribe email was created (inclusive).",
      optional: true,
    },
    endTime: {
      type: "integer",
      label: "End Time",
      description:
        "Refers end of the time range in unix timestamp when an unsubscribe email was created (inclusive).",
      optional: true,
    },
    numberOfSupressions: {
      type: "integer",
      label: "Max # of Global Supressions to Return",
      description: "Indicates the max number of global supressions to return.",
    },
  },
  methods: {
    ...common.methods,
  },
  async run() {
    const constraints = {
      numberOfSupressions: {
        presence: true,
        numericality: {
          onlyInteger: true,
          greaterThan: 0,
          message: "must be positive integer, greater than zero.",
        },
      },
    };
    if (this.startTime != null) {
      constraints.startTime = {
        numericality: {
          onlyInteger: true,
          greaterThan: 0,
          message: "must be positive integer, greater than zero.",
        },
      };
    }
    if (this.endTime != null) {
      constraints.endTime = {
        numericality: {
          onlyInteger: true,
          greaterThan: this.startTime > 0 ?
            this.startTime :
            0,
          message: "must be positive integer, non zero, greater than `startTime`.",
        },
      };
    }
    const validationResult = validate(
      {
        startTime: this.startTime,
        endTime: this.endTime,
        numberOfSupressions: this.numberOfSupressions,
      },
      constraints,
    );
    this.checkValidationResults(validationResult);
    const globalSupressionsGenerator =
      await this.sendgrid.listGlobalSupressions(
        this.startTime,
        this.endTime,
        this.numberOfSupressions,
      );
    const globalSupressions = [];
    let globalSupression;
    do {
      globalSupression = await globalSupressionsGenerator.next();
      if (globalSupression.value) {
        globalSupressions.push(globalSupression.value);
      }
    } while (!globalSupression.done);
    return globalSupressions;
  },
};

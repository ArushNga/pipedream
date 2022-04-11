import vercel from "../../vercel.app.mjs";

export default {
  key: "vercel-new-deployment",
  name: "New Deployment",
  description: "Emit new event when a deployment is created",
  version: "0.0.1",
  type: "source",
  dedupe: "unique",
  props: {
    vercel,
    db: "$.service.db",
    timer: {
      type: "$.interface.timer",
      default: {
        intervalSeconds: 60 * 15,
      },
    },
    project: {
      propDefinition: [
        vercel,
        "project",
      ],
    },
    state: {
      propDefinition: [
        vercel,
        "state",
      ],
    },
    max: {
      propDefinition: [
        vercel,
        "max",
      ],
    },
  },
  hooks: {
    async deploy() {
      await this.processEvent(10);
    },
  },
  methods: {
    generateMeta(deployment) {
      const {
        uid,
        name,
        state,
        created,
      } = deployment;
      return {
        id: uid,
        summary: `${name || uid} ${state}`,
        ts: created,
      };
    },
    async processEvent(max) {
      const params = {
        projectId: this.project,
        state: this.state,
      };
      const deployments = await this.vercel.listDeployments(params, max);
      for (const deployment of deployments) {
        const meta = this.generateMeta(deployment);
        this.$emit(deployment, meta);
      }
    },
  },
  async run() {
    await this.processEvent(this.max);
  },
};

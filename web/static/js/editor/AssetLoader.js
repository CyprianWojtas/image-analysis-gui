import Wiki from "./Wiki.js";
export default class AssetLoader {
    static async loadNodeTypes() {
        this.nodesData = await (await fetch("/api/nodes")).json();
        this.variableTypes = await (await fetch("/api/variable-types.json")).json();
        for (const nodeId in this.nodesData) {
            const node = this.nodesData[nodeId];
            if (!node.customClass)
                continue;
            node.class = (await import(`/api/nodes/${nodeId}`)).default;
        }
        Wiki.addNodes(this.nodesData);
    }
}
//# sourceMappingURL=AssetLoader.js.map
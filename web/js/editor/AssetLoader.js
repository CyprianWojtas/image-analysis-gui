export default class AssetLoader {
    static async loadNodeTypes() {
        const nodes = await (await fetch("/api/nodes")).json();
        this.nodesData = nodes.nodes;
        this.nodesGroups = nodes.groups;
        this.variableTypes = await (await fetch("/api/variable-types.json")).json();
        for (const nodeId in this.nodesData) {
            const node = this.nodesData[nodeId];
            if (!node.customClass)
                continue;
            node.class = (await import(`/api/nodes/${nodeId}`)).default;
        }
    }
}
//# sourceMappingURL=AssetLoader.js.map
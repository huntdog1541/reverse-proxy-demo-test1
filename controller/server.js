import express from "express";
import Docker from "dockerode";
import cors from "cors";

const docker = new Docker({ socketPath: "/var/run/docker.sock" });
const app = express();
app.use(cors());
app.use(express.json());

async function setContainerState(containerName, action) {
    const container = docker.getContainer(containerName);
    try {
        if (action === "start") await container.start();
        if (action === "stop") await container.stop();
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

app.post("/api/:action/:name", async (req, res) => {
    const { action, name } = req.params;
    if (!["start", "stop"].includes(action)) return res.status(400).json({ error: "Invalid action" });
    const result = await setContainerState(name, action);
    res.json(result);
});

app.get("/api/status/:name", async (req, res) => {
    const container = docker.getContainer(req.params.name);
    try {
        const data = await container.inspect();
        res.json({ running: data.State.Running });
    } catch (err) {
        res.json({ running: false, error: err.message });
    }
});

app.listen(3000, () => console.log("Controller listening on port 3000"));

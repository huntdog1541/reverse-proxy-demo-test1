import express from "express";
import Docker from "dockerode";
import cors from "cors";

const docker = new Docker({ socketPath: "/var/run/docker.sock" });
const app = express();
app.use(cors());
app.use(express.json());

// List all running site containers
app.get("/api/sites", async (req, res) => {
    const containers = await docker.listContainers({ all: true });
    const sites = containers
        .filter(c => c.Names.some(n => n.startsWith("/site-")))
        .map(c => ({
            name: c.Names[0].replace("/", ""),
            status: c.State,
            running: c.State === "running",
            labels: c.Labels
        }));
    res.json(sites);
});

// Create a new site container
app.post("/api/sites", async (req, res) => {
    const { name, hostname } = req.body;
    if (!name || !hostname) return res.status(400).json({ error: "name and hostname are required" });

    try {
        const container = await docker.createContainer({
            name: `site-${name}`,
            Image: "nginx:alpine",
            Labels: {
                "traefik.enable": "true",
                [`traefik.http.routers.${name}.rule`]: `Host(\`${hostname}\`)`,
                [`traefik.http.services.${name}.loadbalancer.server.port`]: "80"
            },
            HostConfig: {
                NetworkMode: "reverse-proxy-demo_web" // network name from docker-compose
            }
        });
        await container.start();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Delete a site container
app.delete("/api/sites/:name", async (req, res) => {
    const container = docker.getContainer(`site-${req.params.name}`);
    try {
        await container.stop();
        await container.remove();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(3000, () => console.log("Controller running on port 3000"));

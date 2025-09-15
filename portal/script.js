const controllerBase = "http://controller.localhost/api";

async function toggleSite(name, action) {
    await fetch(`${controllerBase}/${action}/${name}`, { method: "POST" });
    updateStatus(name);
}

async function updateStatus(name) {
    const res = await fetch(`${controllerBase}/status/${name}`);
    const data = await res.json();
    document.getElementById(`${name}-status`).textContent = data.running ? "Running" : "Stopped";
}

setInterval(() => {
    updateStatus("site-a");
    updateStatus("site-b");
}, 3000);

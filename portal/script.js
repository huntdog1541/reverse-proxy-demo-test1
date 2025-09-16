const controllerBase = "http://controller.localhost/api";

async function loadSites() {
    const res = await fetch(`${controllerBase}/sites`);
    const sites = await res.json();
    const div = document.getElementById("siteList");
    div.innerHTML = "";
    sites.forEach(s => {
        const el = document.createElement("div");
        el.innerHTML = `
      <p>${s.name} — ${s.running ? "🟢 Running" : "🔴 Stopped"}</p>
      <a href="http://${s.labels[`traefik.http.routers.${s.name.replace('site-','')}.rule`]?.match(/`(.+?)`/)?.[1] || '#'}" target="_blank">Open</a>
      <button onclick="removeSite('${s.name.replace('site-','')}')">Delete</button>
    `;
        div.appendChild(el);
    });
}

async function createSite() {
    const name = document.getElementById("newName").value.trim();
    const hostname = document.getElementById("newHost").value.trim();
    if (!name || !hostname) return alert("Enter name and hostname");
    await fetch(`${controllerBase}/sites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, hostname })
    });
    loadSites();
}

async function removeSite(name) {
    await fetch(`${controllerBase}/sites/${name}`, { method: "DELETE" });
    loadSites();
}

setInterval(loadSites, 5000);
loadSites();

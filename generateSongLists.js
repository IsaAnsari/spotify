const fs = require("fs");
const path = require("path");

// main songs directory
const mainDir = path.join(__dirname, "songs");

fs.readdirSync(mainDir).forEach(folder => {
    const artistPath = path.join(mainDir, folder);
    const infoFile = path.join(artistPath, "info.json");

    if (fs.lstatSync(artistPath).isDirectory()) {
        const files = fs.readdirSync(artistPath);
        const songs = files.filter(f => f.endsWith(".mp3"));
        const cover = files.find(f => f.endsWith(".jpg") || f.endsWith(".png")) || "";

        let title = folder;
        let description = `${folder} Songs`;

        if (fs.existsSync(infoFile)) {
            const info = JSON.parse(fs.readFileSync(infoFile, "utf8"));
            title = info.title || title;
            description = info.description || description;
        }

        const data = {
            title,
            description,
            cover: cover,
            songs: songs
        };

        fs.writeFileSync(
            path.join(artistPath, "list.json"),
            JSON.stringify(data, null, 4),
            "utf8"
        );

        console.log(`✅ Created list.json for ${folder}`);
    }
});

// src/lib/menuItems.js
// src/lib/menuItems.js
export const menu_items = [
    {
        name: "Explore",
        children: [
            { name: "Family Web", route: "/explore/web" },
            { name: "Family Tree", route: "/explore/tree" },
            { name: "Timeline", route: "/explore/timeline" },
            { name: "Geo Map", route: "/explore/map" },
        ],
    },
    {
        name: "Color Theme",
        route: "/theme",
    },
    {
        name: "Upload GEDCOM",
        route: "/upload",
    },
];

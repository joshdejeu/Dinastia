// src/lib/menuItems.js
export const menu_items = [
    {
        name: "Explore",
        route: "/explore/web3D",
        children: [
            {
                name: "Web 3D", route: "/explore/web3D",
            },
            {
                name: "Web 2D", route: "/explore/web2D",
                settings: [
                    {
                        name: "Freeze Nodes",
                        value: false
                    },
                ]
            },
            {
                name: "Family Tree", route: "/explore/tree", 
                // settings: [
                //     {
                //         name: "Vertical",
                //         value: true,
                //     },
                //     {
                //         name: "Horizontal",
                //         value: false,
                //     },
                // ]
            },
            { name: "Timeline", route: "/explore/timeline" },
            {
                name: "Geo Map", route: "/explore/map",
                settings: [
                    {
                        name: "Stars",
                        value: false,
                    },
                    {
                        name: "Day/Night Cycle",
                        value: false,
                    },
                    {
                        name: "Static Light Mode",
                        value: true,
                    },
                    {
                        name: "Cloud Overlay",
                        value: false,
                    },
                    {
                        name: "Auto-Rotate",
                        value: false,
                    },
                    {
                        name: "Arcs",
                        value: true,
                    },
                ]
            },
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

// later
// $: settingsMap = Object.fromEntries(
//     exploreSettings.map(s => [s.id, s])
// );

// // Later:
// if (settingsMap.freezeNodes?.value) {
//     // ...
// }
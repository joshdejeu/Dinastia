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
            { name: "Family Tree", route: "/explore/tree" },
            { name: "Timeline", route: "/explore/timeline" },
            {
                name: "Geo Map", route: "/explore/map",
                settings: [
                    {
                        name: "Day Time",
                        value: true,
                        data: "//unpkg.com/three-globe/example/img/earth-day.jpg",
                    },
                    {
                        name: "Clouds",
                        value: false,
                    },
                    {
                        name: "Auto Spin",
                        value: false,
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
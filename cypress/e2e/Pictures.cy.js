const getFileInput = () => cy.get(`input[accept="image/*"]`);
const getTagInput = () => cy.get(`input[placeholder="Search value"]`);
const getUploadBtn = () => cy.get("button").contains("Upload");

const uploadTest = (images = [], compressed = false) => {
    cy.get(`input[type="checkbox"]`).should("be.checked");
    if (!compressed) {
        cy.get(`input[type="checkbox"]`).uncheck();
    }

    getFileInput().should("be.exist");
    for (const image of images) {
        getFileInput().selectFile(`cypress/images/${image}`, { force: true });
    }

    getTagInput().type("pictures{downArrow}{enter}");

    // Check if tag is added
    cy.get(`[test=tag-pill]`).contains("pictures").should("be.visible");

    getUploadBtn().click();

    // Wait for the success message
    cy.contains("Success").should("be.visible");
};

const openFirstImage = () => {
    cy.get("div.lazy-load-image").first().click();
};

// describe("Upload image to the dashboard", () => {
//     beforeEach(() => {
//         cy.login();
//         cy.visit("/upload");
//         cy.get("h3").should("be.visible").should("have.text", "Upload pictures");
//     });

//     it("Uploads a file compressed file", () => {
//         uploadTest(["wall.webp"], true);
//     });

//     it("Uploads uncompressed file", () => {
//         uploadTest(["castle.jpg"]);
//     });

//     it("Uploads multiple images to the dashboard", () => {
//         uploadTest(["wall.webp", "castle.jpg"]);
//     });
// });

describe("View uploaded image", () => {
    beforeEach(() => {
        cy.login();
        cy.visit("/");
    });

    it("Loads dashboard and views waits for images to load", () => {
        cy.get("div.lazy-load-image").should("be.visible");
    });

    it("Can share image", () => {
        openFirstImage();

        let menu = cy.get("svg.tabler-icon-dots-vertical").parent().parent();
        menu.scrollIntoView().should("be.visible").click();

        cy.contains("Make public").should("be.visible").click();
        cy.contains("Granted access").should("be.visible"); // Wait for confirmation

        menu.scrollIntoView().should("be.visible").click();
        cy.contains("Copy link").should("be.visible").click(); // Copy link

        cy.getClipboard().then((link) => {
            cy.visit(link); // Test this link

            cy.get("div.lazy-load-image").should("be.visible");
        });
    });

    it("Can delete image", () => {
        openFirstImage();

        let menu = cy.get("svg.tabler-icon-dots-vertical").parent().parent();
        menu.scrollIntoView().should("be.visible").click();

        cy.contains("Delete").click();
        cy.contains("Delete picture?").scrollIntoView().should("be.visible");
        cy.get("button").contains("Delete").click().click();

        // Wait for deletetion confirmation
        cy.contains("Image was deleted successfully").should("be.visible");
    });
});

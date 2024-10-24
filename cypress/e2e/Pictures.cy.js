const getFileInput = () => cy.get(`input[accept="image/*"]`);
const getTagInput = () => cy.get(`input[placeholder="Search value"]`);
const getUploadBtn = () => cy.get("button").contains("Upload");

describe("Upload image to the dashboard", () => {
    beforeEach(() => {
        cy.login();
        cy.visit("/upload");
        cy.get("h3").should("be.visible").should("have.text", "Upload pictures");
    });
    it("Uploads a file", () => {
        getFileInput().should("be.exist");
        getFileInput().selectFile("cypress/images/photographer.avif", { force: true });

        getTagInput().type("pictures{downArrow}{enter}");

        // Check if tag is added
        cy.get(`[test=tag-pill]`).contains("pictures").should("be.visible");

        getUploadBtn().click();

        // Wait for the success message
        cy.contains("Success").should("be.visible");
    });
});

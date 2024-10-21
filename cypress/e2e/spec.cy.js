describe("Can visit the website", () => {
    it("Visits the website", () => {
        cy.visit("/");

        it("Has a login button", () => {
            cy.get("button[data-with-left-section='true']").should("be.visible").should("have.text", "Login");
        });
    });
});

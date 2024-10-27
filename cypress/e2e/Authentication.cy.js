describe("Can visit the login page", () => {
    beforeEach(() => {
        cy.visit("/auth");
    });
    it("Visits the website", () => {
        cy.get("button[data-with-left-section='true']").should("be.visible").should("have.text", "Login");
    });

    it("Registration and login section working correctly", () => {
        let registerSectionBtn = cy.get("button[test='register-btn']");
        registerSectionBtn.should("be.visible").should("have.text", "REGISTER");
        registerSectionBtn.click();

        let sumbitBtn = cy.get("button[data-with-left-section='true']");

        let username = cy.get("input[test='username-input']");
        let password = cy.get("input[test='password-input']");

        // Should throw error
        sumbitBtn.click();
        cy.url().should("have.string", "/auth");

        username.type("test");
        password.type("test");

        // Check if error will be thorwn
        sumbitBtn.click();
        cy.url().should("have.string", "/auth");
    });
});

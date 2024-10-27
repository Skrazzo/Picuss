describe("Can visit the login page and login", () => {
    beforeEach(() => {
        cy.visit("/auth");
    });

    it("Visits the website | And logs in", () => {
        let sumbitBtn = cy.get("button[data-with-left-section='true']");
        sumbitBtn.should("be.visible").should("have.text", "Login");

        let username = cy.get("input[test='username-input']");
        let password = cy.get("input[test='password-input']");

        username.type("cypress");
        password.type("cypress123");

        sumbitBtn.click();

        cy.url().should("be.string", "/");
        cy.get("p[test='logo-text']").should("be.visible").should("have.text", "Picuss");
    });
});

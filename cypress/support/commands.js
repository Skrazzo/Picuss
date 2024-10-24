// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// import "cypress-file-upload";

Cypress.Commands.add("login", (user = "cypress", pass = "cypress123") => {
    cy.session([user, pass], () => {
        cy.visit("/auth");
        let sumbitBtn = cy.get("button[data-with-left-section='true']");
        sumbitBtn.should("be.visible").should("have.text", "Login");

        let username = cy.get("input[test='username-input']");
        let password = cy.get("input[test='password-input']");

        username.type(user);
        password.type(pass);

        sumbitBtn.click();
        cy.url().should("be.string", "/");
        cy.get("p[test='logo-text']").should("be.visible").should("have.text", "Picuss");
    });
});

Cypress.Commands.add("getClipboard", () => {
    return cy.window().then((win) => {
        return win.navigator.clipboard.readText();
    });
});

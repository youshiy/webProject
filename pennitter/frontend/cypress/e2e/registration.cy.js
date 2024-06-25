describe('Test User Registration', () => {
  it('invalid username, email, and password format', () => {
    // launch the web app
    cy.visit('http://localhost:3000');
    // check that the navbar button with caption 'Registration' is displayed
    cy.get('.standardScreen').find('a').contains('Registration');
    // click on the Registration button
    cy.get('.standardScreen').find('a').contains('Registration').click();
    // test that the 'Register' button is visible
    cy.get('button').contains('Register');

    // create a new user
    // type the username of the user
    // test that the input box is updated correctly
    cy.get('input[placeholder="username"]').type('-mike-').should('have.value', '-mike-');

    // type the email of the user
    // test that the input box is updated correctly
    cy.get('input[placeholder="email"]').type('mikeupenn.edu').should('have.value', 'mikeupenn.edu');

    // type the password of the user
    // test that the input box is updated correctly
    cy.get('input[placeholder="password"]').type('weakpassword').should('have.value', 'weakpassword');

    // show password
    cy.contains('Toggle Password Visibility').click();

    // click on the register button
    cy.contains('Register').click();

    // test that validation errors are displayed
    cy.contains(/Username must be/);
    cy.contains(/Email must be/);
    cy.contains(/Password must be/);

    // Wait for 1000 milliseconds (1 second)
    cy.wait(10000);
  });

  it('username and email already exist', () => {
    // launch the web app
    cy.visit('http://localhost:3000');
    // check that the navbar button with caption 'Registration' is displayed
    cy.get('.standardScreen').find('a').contains('Registration');
    // click on the Registration button
    cy.get('.standardScreen').find('a').contains('Registration').click();
    // test that the 'Register' button is visible
    cy.get('button').contains('Register');

    // create a new user
    // type the username of the user
    // test that the input box is updated correctly
    cy.get('input[placeholder="username"]').type('mrabbitz').should('have.value', 'mrabbitz');

    // type the email of the user
    // test that the input box is updated correctly
    cy.get('input[placeholder="email"]').type('mrabbitz@upenn.edu').should('have.value', 'mrabbitz@upenn.edu');

    // type the password of the user
    // test that the input box is updated correctly
    cy.get('input[placeholder="password"]').type('Password1!').should('have.value', 'Password1!');

    // show password
    cy.contains('Toggle Password Visibility').click();

    // click on the login button
    cy.contains('Register').click();

    // test that validation errors are displayed
    cy.contains(/Username and Email already in use!/);

    // Wait for 1000 milliseconds (1 second)
    cy.wait(10000);
  });

  it('successful registration', () => {
    // launch the web app
    cy.visit('http://localhost:3000');
    // check that the navbar button with caption 'Registration' is displayed
    cy.get('.standardScreen').find('a').contains('Registration');
    // click on the Registration button
    cy.get('.standardScreen').find('a').contains('Registration').click();
    // test that the 'Register' button is visible
    cy.get('button').contains('Register');

    // create a new user
    // type the username of the user
    // test that the input box is updated correctly
    cy.get('input[placeholder="username"]').type('mrabbitz123').should('have.value', 'mrabbitz123');

    // type the email of the user
    // test that the input box is updated correctly
    cy.get('input[placeholder="email"]').type('mrabbitz123@upenn.edu').should('have.value', 'mrabbitz123@upenn.edu');

    // type the password of the user
    // test that the input box is updated correctly
    cy.get('input[placeholder="password"]').type('Password1!').should('have.value', 'Password1!');

    // show password
    cy.contains('Toggle Password Visibility').click();

    // click on the login button
    cy.contains('Register').click();

    // test that validation errors are displayed
    cy.contains(/User Created!/);

    // Wait for 1000 milliseconds (1 second)
    cy.wait(10000);
  });
});

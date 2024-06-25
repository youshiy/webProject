describe('Test Login, Follow User, and View Followed Users Posts', () => {
  it('invalid username, email, and password format', () => {
    // launch the web app
    cy.visit('http://localhost:3000');
    // test that the 'Login' button is visible
    cy.get('.MuiButton-outlined:contains("Login")');

    // login user
    // type the username/email of the user
    // test that the input box is updated correctly
    cy.get('input[placeholder="username/email"]').type('-mike-').should('have.value', '-mike-');

    // type the password of the user
    // test that the input box is updated correctly
    cy.get('input[placeholder="password"]').type('weakpassword').should('have.value', 'weakpassword');

    // show password
    cy.contains('Toggle Password Visibility').click();

    // click on the login button
    cy.get('.MuiButton-outlined:contains("Login")').click();

    // test that validation errors are displayed
    cy.contains(/Username must be/);
    cy.contains(/Email must be/);
    cy.contains(/Password must be/);

    // Wait for 1000 milliseconds (1 second)
    cy.wait(10000);
  });

  it('invalid credentials', () => {
    // launch the web app
    cy.visit('http://localhost:3000');
    // test that the 'Login' button is visible
    cy.get('.MuiButton-outlined:contains("Login")');

    // login user
    // type the username/email of the user
    // test that the input box is updated correctly
    cy.get('input[placeholder="username/email"]').type('mrabbitz123').should('have.value', 'mrabbitz123');

    // type the password of the user
    // test that the input box is updated correctly
    cy.get('input[placeholder="password"]').type('Password1!!').should('have.value', 'Password1!!');

    // show password
    cy.contains('Toggle Password Visibility').click();

    // click on the login button
    cy.get('.MuiButton-outlined:contains("Login")').click();

    // test that validation errors are displayed
    cy.contains(/Error logging in: Invalid Credentials!/);

    // Wait for 1000 milliseconds (1 second)
    cy.wait(10000);
  });

  it('successful login', () => {
    // launch the web app
    cy.visit('http://localhost:3000');
    // test that the 'Login' button is visible
    cy.get('.MuiButton-outlined:contains("Login")');

    // login user
    // type the username/email of the user
    // test that the input box is updated correctly
    cy.get('input[placeholder="username/email"]').type('mrabbitz123').should('have.value', 'mrabbitz123');

    // type the password of the user
    // test that the input box is updated correctly
    cy.get('input[placeholder="password"]').type('Password1!').should('have.value', 'Password1!');

    // show password
    cy.contains('Toggle Password Visibility').click();

    // Wait for 1000 milliseconds (1 second)
    cy.wait(5000);

    // click on the login button
    cy.get('.MuiButton-outlined:contains("Login")').click();

    // Wait for 1000 milliseconds (1 second)
    cy.wait(5000);

    // check that the navbar button with caption 'Find & Follow' is displayed
    cy.get('.standardScreen').find('a').contains(/Find & Follow/);
    // click on the Find & Follow button
    cy.get('.standardScreen').find('a').contains(/Find & Follow/).click();

    // Wait for 1000 milliseconds (1 second)
    cy.wait(5000);

    // check that the Follow button is displayed
    cy.get('button:contains("Follow"):not(:contains("Find & Follow")):not(:contains("Followers"))');
    // click on the Follow button
    cy.get('button:contains("Follow"):not(:contains("Find & Follow")):not(:contains("Followers"))').first().click();

    // Wait for 1000 milliseconds (1 second)
    cy.wait(5000);

    // check that the navbar button with caption 'Activity Feed' is displayed
    cy.get('.standardScreen').find('a').contains(/Activity Feed/);
    // click on the Activity Feed button
    cy.get('.standardScreen').find('a').contains(/Activity Feed/).click();

    // verify you can see post of user you followed
    cy.contains('a', /^mrabbitz$/);

    // Wait for 1000 milliseconds (1 second)
    cy.wait(5000);

    // unfollow user

    // check that the navbar button with caption 'Find & Follow' is displayed
    cy.get('.standardScreen').find('a').contains(/Find & Follow/);
    // click on the Find & Follow button
    cy.get('.standardScreen').find('a').contains(/Find & Follow/).click();

    // Wait for 1000 milliseconds (1 second)
    cy.wait(5000);

    // check that the Follow button is displayed
    cy.get('button').contains('Unfollow');
    // click on the Follow button
    cy.get('button').contains('Unfollow').click();

    // Wait for 1000 milliseconds (1 second)
    cy.wait(5000);

    // check that the navbar button with caption 'Activity Feed' is displayed
    cy.get('.standardScreen').find('a').contains(/Activity Feed/);
    // click on the Activity Feed button
    cy.get('.standardScreen').find('a').contains(/Activity Feed/).click();

    // verify you CANNOT see post of user you followed
    cy.contains('a', /^mrabbitz$/).should('not.exist');

    // Wait for 1000 milliseconds (1 second)
    cy.wait(10000);
  });
});
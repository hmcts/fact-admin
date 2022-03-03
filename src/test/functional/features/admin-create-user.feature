Feature: create admin user

  Background:
    Given I am on new browser
    Given I am on FACT homepage
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my super user authenticated credentials
    And click the Sign In button
    When I click on my account link
    Then I am redirected to the page "Create A User"

  Scenario: creating new user with valid e-mail and password
    When I enter Email "test@gmail.com"
    When I enter First Name "testuser" to create new user
    When I enter Last Name "lastname" to create new user
    Then I select the user role as fact-admin for new user
    Then I click create user button
    When I enter Password "Pa55word11"
    Then I click confirm button
    Then I can see green success message "User invited successfully"

  Scenario: creating new user with duplicate e-mail
    When I enter Email "hmcts.super.fact@gmail.com"
    When I enter First Name "testuser" to create new user
    When I enter Last Name "lastname" to create new user
    Then I select the user role as fact-admin for new user
    Then I click create user button
    When I enter Password "Pa55word11"
    Then I click confirm button
    Then The error message display for creating user "User with this email already exists."

  Scenario: creating new user with blank entries
    When I enter Email "test@gmail.com"
    When I enter First Name "" to create new user
    When I enter Last Name "" to create new user
    Then I select the user role as fact-admin for new user
    Then I click create user button
    Then The error message display for creating user "All fields are required."

  Scenario: Updating test user role
    When I click on edit user
    When I enter User Email "test@fact.com"
    Then I click search user button
    Then I select the user role as fact-super-admin
    Then I click edit user button
    Then I can see user details updated message "User details successfully updated"
    When I enter User Email "test@fact.com"
    Then I click search user button
    Then I select the user role as fact-admin to update user
    Then I click edit user button
    Then I can see user details updated message "User details successfully updated"

  Scenario: Updating test user name
    When I click on edit user
    When I enter User Email "test@fact.com"
    Then I click search user button
    When I enter First Name "first name" to update user
    When I enter Last Name "last name" to update user
    Then I click edit user button
    Then I can see user details updated message "User details successfully updated"
    When I enter User Email "test@fact.com"
    Then I click search user button
    When I enter First Name "test1" to update user
    When I enter Last Name "test1" to update user
    Then I click edit user button
    Then I can see user details updated message "User details successfully updated"

  Scenario: Removing test user role
    When I click on edit user
    When I enter User Email "test@fact.com"
    Then I click search user button
    Then I select the user role as fact-admin to update user
    Then I click edit user button
    Then I can see user details updated message "User details successfully updated"
    When I enter User Email "test@fact.com"
    Then I click search user button
    Then I click remove role button
    When I click on confirm remove role button
    Then I can see user details updated message "User roles successfully removed"

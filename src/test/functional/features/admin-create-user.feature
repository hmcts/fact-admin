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
    When I enter First Name "testuser"
    When I enter Last Name "lastname"
    Then I select the user role as fact-admin
    Then I click create user button
    When I enter Password "Pa55word11"
    Then I click confirm button
    Then I can see green success message "User invited successfully"

  Scenario: creating new user with duplicate e-mail
    When I enter Email "hmcts.super.fact@gmail.com"
    When I enter First Name "test"
    When I enter Last Name "test"
    Then I select the user role as fact-admin
    Then I click create user button
    When I enter Password "Pa55word11"
    Then I click confirm button
    Then The error message display for creating user "User with this email already exists."

  Scenario: creating new user with blank entries
    When I enter Email "test@gmail.com"
    When I enter First Name ""
    When I enter Last Name ""
    Then I select the user role as fact-admin
    Then I click create user button
    Then The error message display for creating user "All fields are required."

  Scenario: Updating admin user role to super-admin
    When I click on edit user
    When I enter User Email "test@fact.com"
    Then I click search user button
    Then I select the user role as fact-super-admin
    Then I click edit user button
    Then I can see user details updated message "User details successfully updated"
    When I enter User Email "test@fact.com"
    Then I click search user button
    Then I select the user role as fact-admin
    Then I click edit user button
    Then I can see user details updated message "User details successfully updated"

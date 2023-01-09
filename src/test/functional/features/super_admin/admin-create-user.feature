
Feature: create admin user

  Background:
    Given I am on new browser
    Given I am on FACT homepage
    Then I am logged out if I am an admin user
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my super user authenticated credentials
    And click the Sign In button
    When I click on users link

  Scenario: clicking the link Users, will navigate to the Idam web dashboard:
    Then I am redirected to the IDAM User dashboard


Feature: create admin user

  Background:
    Given I am on new browser
    Given I am on FACT homepage
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my super user authenticated credentials
    And click the Sign In button
    #When I go to the courts page
    When I click on users link

  Scenario: clicking the link Users, will navigate to the Idam web dashboard:
    Then I am redirected to the IDAM User dashboard

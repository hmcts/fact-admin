
Feature: create admin user

  Scenario: clicking the link Users, will navigate to the Idam web dashboard:
    When I log in as a super-admin
    When I click on users link
    Then I am redirected to the IDAM User dashboard

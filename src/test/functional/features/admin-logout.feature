Feature: Logout

  Background:
    And I am on FACT homepage

  Scenario: Logout
  Given that I am a logged-in admin or super admin user
  When I click the Logout link
  Then the system will log me out

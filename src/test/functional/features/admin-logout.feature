Feature: Logout

  Background:
    Given I am on new browser
    And I am on FACT homepage
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my authenticated credentials
    And click the Sign In button
    Then the system will sign me in


  Scenario: Logout
  Given that I am a logged-in admin or super admin user
  When I click the Logout link
  Then the system will log me out

Feature: Retired service access

  Scenario: Admin user is directed to the replacement service page
    Given I am on new browser
    And I am on FACT homepage
    And I click the Logout link
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my authenticated credentials
    And click the Sign In button
    Then I am directed to the retired service page
    When I click the Logout link
    Then the system will log me out

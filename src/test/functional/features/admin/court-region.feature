Feature: Homepage

  Background:
    Given I am on new browser
    Given I am on FACT homepage
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my authenticated credentials
    And click the Sign In button
    When I select Include closed courts

  Scenario: View the list
    Then I can view the courts regions
    When I select the region Yorkshire and the Humber "9"
    Then I can see the courts "bradford-combined-court-centre" and "leeds-combined-court-centre" in the list

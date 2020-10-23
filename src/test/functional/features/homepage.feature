Feature: Homepage

  Background:
    Given I am on FACT homepage
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my authenticated credentials "hmcts.fact@gmail.com" "Pa55word11"
    And click the Sign In button

  Scenario: Load Homepage
    Given I am on FACT homepage
    Then I expect the page header to be "Find a court or tribunal - GOV.UK"

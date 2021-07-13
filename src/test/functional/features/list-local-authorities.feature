Feature: Local authorities List

  Background:
    Given I am on new browser
    Given I am on FACT homepage
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my super user authenticated credentials
    And click the Sign In button
    Then I can view the courts or tribunals in a list format
    When I click on lists link
    Then I am redirected to the "Edit A List" page
    When I hover over the tab title
    And I click the local authorities list
    Then I should land in "Edit Local Authorities" page

  Scenario Outline: Local authorities updated successfully

    When I select local authority "local authority"

    Examples:
      | local authority        |
      | Barnet Borough Council |

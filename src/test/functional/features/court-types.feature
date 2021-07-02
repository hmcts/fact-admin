@Types
Feature: Court Types

  Background:
    Given I am on new browser
    Given I am on FACT homepage
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my authenticated credentials
    And click the Sign In button
    Then I can view the courts or tribunals in a list format
    And they are in alphabetical order


  Scenario Outline: Select a court type
    When I click edit next to court with "<view_court_slug>"
    Then I am redirected to the Edit Court page for the chosen court
    When I hover over types nav element
    When I click the types tab
    Then I can view the existing court types
    When I check a court type
    And I click on save court type
    Then a green update message is displayed showing Court Types updated

    Examples:
      | view_court_slug                        |
      | uxbridge-county-court-and-family-court |


  Scenario Outline: Remove a court type
    When I click edit next to court with "<view_court_slug>"
    Then I am redirected to the Edit Court page for the chosen court
    When I hover over types nav element
    When I click the types tab
    Then I can view the existing court types
    When I uncheck a court type
    Then I click on save court type
    Then a green update message is displayed showing Court Types updated


    Examples:
      | view_court_slug                        |
      | uxbridge-county-court-and-family-court |


  Scenario Outline: Select a court type and leave court code blank
    When I click edit next to court with "<view_court_slug>"
    Then I am redirected to the Edit Court page for the chosen court
    When I hover over types nav element
    When I click the types tab
    Then I can view the existing court types
    When I check a court type which has code associated with it
    Then I click on save court type
    Then a court types error message is displayed

    Examples:
      | view_court_slug                        |
      | uxbridge-county-court-and-family-court |

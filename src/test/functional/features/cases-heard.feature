Feature: Cases-Heard tab

  Background:
    Given I am on new browser
    Given I am on FACT homepage
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my super user authenticated credentials
    And click the Sign In button
    When I select Include closed courts
    Then I can view the courts or tribunals in a list format
    When I click edit next to court with "basingstoke-county-court-and-family-court"
    Then I am redirected to the Edit Court page for the chosen court
    When I hover over opening hours nav element
    When I click the cases heard tab
    Then I can view the areas of law listed


  Scenario: AS an admin user when I select and deselect areas of law and click update button I should be able to update it successfully.

    When I select area of law with id 34255 and 34247
    And And I click on update cases heard
    Then Success message is displayed for cases heard with summary "Cases heard updated"
    When I reload the page
    Then area of law with id 34255 and 34247 should be selected
    When I unselect area of law with id 34255 and 34247
    And And I click on update cases heard
    Then Success message is displayed for cases heard with summary "Cases heard updated"
    When I reload the page
    Then area of law with id 34255 and 34247 should be unselected

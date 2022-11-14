@fact-admin-tab-cases-heard
Feature: Cases-Heard tab

  Background:
    Given I am on new browser
    Given I am on FACT homepage
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my super user authenticated credentials
    And click the Sign In button
    When I go to the courts page
    When I click edit next to court with "aylesbury-crown-court"
    Then I am redirected to the Edit Court page for the chosen court
    When I hover over opening hours nav element
    When I click the cases heard tab

  Scenario Outline: AS an admin user when I select and deselect areas of law and click update button I should be able to update it successfully.
    When I select areas of law "<areaOfLaw1>" and "<areaOfLaw2>"
    And And I click on update cases heard
    Then Success message is displayed for cases heard with summary "Cases heard updated"
    When I reload the page
    Then areas of law "<areaOfLaw1>" and "<areaOfLaw2>" should be selected
    When I unselect area of law "<areaOfLaw1>" and "<areaOfLaw2>"
    And And I click on update cases heard
    Then Success message is displayed for cases heard with summary "Cases heard updated"
    When I reload the page
    Then areas of law "<areaOfLaw1>" and "<areaOfLaw2>" should be unselected

    Examples:
      | areaOfLaw1 | areaOfLaw2        |
      | bankruptcy | domestic-violence |

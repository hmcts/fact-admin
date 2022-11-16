
@fact-admin-tab-spoe
Feature: Spoe tab

  Background:
    Given I am on new browser
    Given I am on FACT homepage
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my super user authenticated credentials
    And click the Sign In button
    When I go to the courts page
    When I click edit next to court with "administrative-court"
    Then I am redirected to the Edit Court page for the chosen court
    When I hover over opening hours nav element
    When I click spoe tab

  Scenario Outline: As an super admin user I can update the spoe areas of laws for the court.

    When I select spoe areas of law "<aolAdoption>" and "<aolChildren>"
    And  I click spoe update
    Then Success message is displayed for spoe with summary "Single point of entries updated"
    When I reload the page
    Then spoe area of law  "<aolAdoption>" and "<aolChildren>" should be selected
    When I unselect spoe area of law "<aolAdoption>" and "<aolChildren>"
    And  I click spoe update
    Then Success message is displayed for spoe with summary "Single point of entries updated"
    When I reload the page
    Then spoe areas of law "<aolAdoption>" and "<aolChildren>" should be unselected

    Examples:
      | aolAdoption | aolChildren    |
      | adoption1    | children1       |

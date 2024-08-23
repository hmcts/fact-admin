@fact-admin-tab-types
Feature: Court Types

#  Background:
#    Given I am on new browser
#    Given I am on FACT homepage
#    Then I am logged out if I am an admin user
#    And I am on the admin portal sign in page
#    When I fill in the Username and Password fields with my super user authenticated credentials
#    And click the Sign In button
#    When I click edit next to court with "basingstoke-county-court-and-family-court"
#    Then I am redirected to the Edit Court page for the chosen court
#    When I hover over types nav element
#    When I click the types tab
#
#  Scenario: Select and remove a court type
#    When I check code errors
#    When I check a court type
#    When I enter the code "111"
#    And I click on save court type
#    Then a green update message is displayed showing Court Types updated
#    When I uncheck a court type
#    Then I click on save court type
#    Then a green update message is displayed showing Court Types updated
#
#  Scenario: Select a court type and leave court code blank
#    When I check a court type which has code associated with it
#    Then I click on save court type
#    Then a court types error message is displayed
#
#  Scenario: Adding and deleting GBS Code
#    When I check code errors
#    Then I will make sure that one of the court type is selected
#    Then I will clear the existing gbs code and enter new the one "Test Gbs Code"
#    Then I click on save court type
#    Then a green update message is displayed showing Court Types updated
#
#  Scenario: Adding and removing DX Codes
#    When I check code errors
#    When I remove all existing DX Codes entries and save
#    Then a green update message is displayed showing Court Types updated
#    Then I click add new Dx Code button
#    When I enter a new DX Code "Test123" explanation "test" and explanation Cy "test"
#    Then I click on save court type
#    Then a green update message is displayed showing Court Types updated
#
#  Scenario: Prevent duplicated entries being added for Dx Code
#    When I check code errors
#    When I remove all existing DX Codes entries and save
#    Then a green update message is displayed showing Court Types updated
#    When I enter a new DX Code "Test123" explanation "test" and explanation Cy "test"
#    Then I click on save court type
#    Then a green update message is displayed showing Court Types updated
#    Then I click add new Dx Code button
#    When I enter a new DX Code "Test123" explanation "test" and explanation Cy "test"
#    Then I click on save court type
#    Then a court types error message is displayed

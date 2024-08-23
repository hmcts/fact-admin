@fact-admin-tab-opening-hours
Feature: Opening Hours
#
#  Background:
#    Given a court is created through the API
#    When I log in as a super-admin
#    When I click edit next to the test court
#    Then I am redirected to the Edit Court page for the chosen court
#    When I hover over opening hours nav element
#    When I click the opening hours tab
#
#  Scenario: Add and remove opening hours
#    When I enter a new opening hours entry by selecting description "Counter open" and adding hours "9:00am to 3:30pm"
#    Then I click the Add button in the opening hours tab
#    And I click save
#    And I enter a new opening hours entry by selecting description "Crown Court open" and adding hours "10:00am to 4:00pm"
#    And I click save
#    Then a green update message is displayed in the opening hours tab
#    Then the second last opening hours is displayed with description value "44" and hours "9:00am to 3:30pm"
#    And the court is cleaned up through the API
#
#  Scenario: Reorder opening hours
#    When I enter a new opening hours entry by selecting description "Counter open" and adding hours "9:00am to 3:30pm"
#    Then I click the Add button in the opening hours tab
#    And I click save
#    And I enter a new opening hours entry by selecting description "Crown Court open" and adding hours "10:00am to 4:00pm"
#    And I click save
#    Then a green update message is displayed in the opening hours tab
#    Then the second last opening hours is displayed with description value "44" and hours "9:00am to 3:30pm"
#    And the last opening hours is displayed with description value "49" and hours "10:00am to 4:00pm"
#    When I click the move up button on the last opening hours entry
#    And I click save
#    Then a green update message is displayed in the opening hours tab
#    Then the second last opening hours is displayed with description value "49" and hours "10:00am to 4:00pm"
#    And the last opening hours is displayed with description value "44" and hours "9:00am to 3:30pm"
#    When I click the move down button on the second last opening hours entry
#    And I click save
#    Then a green update message is displayed in the opening hours tab
#    Then the second last opening hours is displayed with description value "44" and hours "9:00am to 3:30pm"
#    And the last opening hours is displayed with description value "49" and hours "10:00am to 4:00pm"
#    And the court is cleaned up through the API
#
#  Scenario: Prevent blank entries being added
#    And I enter a new opening hours entry by selecting description "" and adding hours "10:00am to 4:00pm"
#    And I click save
#    Then An error is displayed for opening hours with summary "Description and hours are required for all opening times." and description field message "Error: Description is required"
#    And I enter a new opening hours entry by selecting description "Crown Court open" and adding hours ""
#    And I click save
#    Then An error is displayed for opening hours with summary "Description and hours are required for all opening times." and hours field message "Error: Hours is required"
#    And the court is cleaned up through the API
#
#  Scenario: Prevent duplicated entries being added
#    When I enter a new opening hours entry by selecting description "Counter open" and adding hours "9:00am to 3:30pm"
#    Then I click the Add button in the opening hours tab
#    And I click save
#    And I enter a new opening hours entry by selecting description "Counter open" and adding hours "9:00am to 3:30pm"
#    And I click save
#    Then An error is displayed for opening hours with summary "All descriptions must be unique." and description field message "Error: Duplicated description"
#    And the court is cleaned up through the API

@fact-admin-tab-opening-hours
Feature: Opening Hours

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

#    When I click the opening hours tab
#    Then I can view the existing opening hours


  Scenario: Add and remove Additional Links
    When test


#  Scenario: Add and remove opening hours
#    # Clear out potential left-over opening hours from the previous run before adding new ones
#    When I remove all existing opening hours entries and save
#    Then a green update message is displayed in the opening hours tab
#    When I enter a new opening hours entry by selecting description at index 4 and adding hours "9:00am to 3:30pm"
#    Then I click the Add button in the opening hours tab
#    And I enter a new opening hours entry by selecting description at index 5 and adding hours "10:00am to 4:00pm"
#    And I click save
#    Then a green update message is displayed in the opening hours tab
#    Then the second last opening hours is displayed with description at index 4 and hours "9:00am to 3:30pm"
#    And the last opening hours is displayed with description at index 5 and hours "10:00am to 4:00pm"
#    When I click the remove button under an opening hours entry
#    And I click the remove button under an opening hours entry
#    And I click save
#    Then a green update message is displayed in the opening hours tab
#    And there are no opening hours entries
#
#  Scenario: Reorder opening hours
#    When I remove all existing opening hours entries and save
#    Then a green update message is displayed in the opening hours tab
#    When I enter a new opening hours entry by selecting description at index 2 and adding hours "9:00am to 4:30pm"
#    And I click the Add button in the opening hours tab
#    And I enter a new opening hours entry by selecting description at index 3 and adding hours "11:00am to 5:00pm"
#    And I click save
#    Then the second last opening hours is displayed with description at index 2 and hours "9:00am to 4:30pm"
#    And the last opening hours is displayed with description at index 3 and hours "11:00am to 5:00pm"
#    When I click the move up button on the last opening hours entry
#    And I click save
#    Then a green update message is displayed in the opening hours tab
#    And the second last opening hours is displayed with description at index 3 and hours "11:00am to 5:00pm"
#    And the last opening hours is displayed with description at index 2 and hours "9:00am to 4:30pm"
#    When I click the move down button on the second last opening hours entry
#    And I click save
#    Then a green update message is displayed in the opening hours tab
#    And the second last opening hours is displayed with description at index 2 and hours "9:00am to 4:30pm"
#    And the last opening hours is displayed with description at index 3 and hours "11:00am to 5:00pm"
#
#  Scenario: Prevent blank entries being added
#    When I enter an incomplete opening hour description
#    And I click save
#    Then An error is displayed for opening hours with summary "Description and hours are required for all opening times." and description field message "Description is required"
#    When I left the opening hours blank and select description at index 6
#    And I click save
#    Then An error is displayed for opening hours with summary "Description and hours are required for all opening times." and hours field message "Hours is required"
#
#  Scenario: Prevent duplicated entries being added
#    When I remove all existing opening hours entries and save
#    When I enter a new opening hours entry by selecting description at index 4 and adding hours "9:00am to 3:30pm"
#    And I click the Add button in the opening hours tab
#    And I enter a new opening hours entry by selecting description at index 4 and adding hours "9:00am to 3:30pm"
#    And I click save
#    Then An error is displayed for opening hours with summary "All descriptions must be unique." and description field message "Duplicated description"

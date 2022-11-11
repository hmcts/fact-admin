@fact-admin-tab-phone-numbers
Feature: Phone Numbers

  Background:
    Given I am on new browser
    Given I am on FACT homepage
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my authenticated credentials
    And click the Sign In button
    When I click edit next to court with "amersham-law-courts"
    Then I am redirected to the Edit Court page for the chosen court
    When I hover over phone numbers nav element
    When I click the phone numbers tab
    When I remove all existing phone number entries and save

  Scenario: Add and remove phone numbers
    Then a green message is displayed for updated entries "Phone Numbers updated"
    When I enter new phone number entry by selecting description at index 4 and entering "0123 456 7890", "Fine" and "Dirwy"
    Then I click the Add button in the phone number tab
    And I enter new phone number entry by selecting description at index 5 and entering "0987 654 321", "Chancery" and "Siawnsri"
    And I click save in the phone number tab
    Then a green message is displayed for updated entries "Phone Numbers updated"
    Then the phone number entry in second last position has description at index 4 number "0123 456 7890" explanation "Fine" and welsh explanation "Dirwy"
    And the phone number entry in last position has description at index 5 number "0987 654 321" explanation "Chancery" and welsh explanation "Siawnsri"

  Scenario: Reorder phone numbers
    Then a green message is displayed for updated entries "Phone Numbers updated"
    When I enter new phone number entry by selecting description at index 2 and entering "0333 222 1111", "ReorderTest1" and "ReorderTest1Cy"
    Then I click the Add button in the phone number tab
    And I enter new phone number entry by selecting description at index 3 and entering "0666 555 4444", "ReorderTest2" and "ReorderTest2Cy"
    And I click save in the phone number tab
    Then a green message is displayed for updated entries "Phone Numbers updated"
    Then the phone number entry in second last position has description at index 2 number "0333 222 1111" explanation "ReorderTest1" and welsh explanation "ReorderTest1Cy"
    And the phone number entry in last position has description at index 3 number "0666 555 4444" explanation "ReorderTest2" and welsh explanation "ReorderTest2Cy"
    When I click the move up button on the last phone number entry
    And I click save in the phone number tab
    Then a green message is displayed for updated entries "Phone Numbers updated"
    Then the phone number entry in second last position has description at index 3 number "0666 555 4444" explanation "ReorderTest2" and welsh explanation "ReorderTest2Cy"
    And the phone number entry in last position has description at index 2 number "0333 222 1111" explanation "ReorderTest1" and welsh explanation "ReorderTest1Cy"
    When I click the move down button on the second last phone number entry
    And I click save in the phone number tab
    Then a green message is displayed for updated entries "Phone Numbers updated"
    Then the phone number entry in second last position has description at index 2 number "0333 222 1111" explanation "ReorderTest1" and welsh explanation "ReorderTest1Cy"
    And the phone number entry in last position has description at index 3 number "0666 555 4444" explanation "ReorderTest2" and welsh explanation "ReorderTest2Cy"

  Scenario: Prevent blank entries being added
    When I left description entry blank in phone number tab and enter phone number "0987 666 5040"
    And I click save in the phone number tab
    Then an error message is displayed for phone number tab with summary "Description and number are required for all phone number entries." and description field message "Description is required"
    # blank entry for phone number
    When I left the phone number entry blank and select description at index 4
    And I click save in the phone number tab
    Then an error message is displayed for phone number tab with summary "Description and number are required for all phone number entries." and number field message "Number is required"

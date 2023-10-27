@fact-admin-tab-phone-numbers
Feature: Phone Numbers

  Background:
    Given a court is created through the API
    When I am on FACT homepage '/'
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my authenticated credentials
    And click the Sign In button
    When I click edit next to the test court
    Then I am redirected to the Edit Court page for the chosen court
    When I hover over phone numbers nav element
    When I click the phone numbers tab

  Scenario: Add and remove phone numbers
    When I enter new phone number entry by selecting description "Admin" and entering "0123 456 7890", "Fine" and "Dirwy"
    Then I click the Add button in the phone number tab
    And I click save in the phone number tab
    And I enter new phone number entry by selecting description "Appeals" and entering "0987 654 321", "Chancery" and "Siawnsri"
    And I click save in the phone number tab
    Then a green message is displayed for updated entries "Phone Numbers updated"
    Then the phone number entry in second last position has description value "199" number "0123 456 7890" explanation "Fine" and welsh explanation "Dirwy"
    And the phone number entry in last position has description value "201" number "0987 654 321" explanation "Chancery" and welsh explanation "Siawnsri"
    And the court is cleaned up through the API

  Scenario: Reorder phone numbers
    When I enter new phone number entry by selecting description "Admin" and entering "0123 456 7890", "Fine" and "Dirwy"
    Then I click the Add button in the phone number tab
    And I click save in the phone number tab
    And I enter new phone number entry by selecting description "Appeals" and entering "0987 654 321", "Chancery" and "Siawnsri"
    And I click save in the phone number tab
    Then a green message is displayed for updated entries "Phone Numbers updated"
    Then the phone number entry in second last position has description value "199" number "0123 456 7890" explanation "Fine" and welsh explanation "Dirwy"
    And the phone number entry in last position has description value "201" number "0987 654 321" explanation "Chancery" and welsh explanation "Siawnsri"
    When I click the move up button on the last phone number entry
    And I click save in the phone number tab
    Then a green message is displayed for updated entries "Phone Numbers updated"
    Then the phone number entry in second last position has description value "201" number "0987 654 321" explanation "Chancery" and welsh explanation "Siawnsri"
    And the phone number entry in last position has description value "199" number "0123 456 7890" explanation "Fine" and welsh explanation "Dirwy"
    When I click the move down button on the second last phone number entry
    And I click save in the phone number tab
    Then a green message is displayed for updated entries "Phone Numbers updated"
    Then the phone number entry in second last position has description value "199" number "0123 456 7890" explanation "Fine" and welsh explanation "Dirwy"
    And the phone number entry in last position has description value "201" number "0987 654 321" explanation "Chancery" and welsh explanation "Siawnsri"
    And the court is cleaned up through the API

  Scenario: Prevent blank entries being added
    When I left description entry blank in phone number tab and enter phone number "0987 666 5040"
    And I click save in the phone number tab
    Then an error message is displayed for phone number tab with summary "Description and number are required for all phone number entries." and description field message "Error: Description is required"
#    # blank entry for phone number
    When I left the phone number entry blank and select description "Admin"
    And I click save in the phone number tab
    Then an error message is displayed for phone number tab with summary "Description and number are required for all phone number entries." and number field message "Error: Number is required"
    And the court is cleaned up through the API

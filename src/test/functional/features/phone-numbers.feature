Feature: Phone Numbers

  Background:
    Given I am on new browser
    Given I am on FACT homepage
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my authenticated credentials
    And click the Sign In button
    Then I can view the courts or tribunals in a list format
    When I click edit next to a chosen court or tribunal
    Then I am redirected to the Edit Court page for the chosen court
    When I click the phone numbers tab
    Then I can view the existing phone numbers

  Scenario: Add new phone numbers
    When I enter new phone number entry by selecting description at index 4 and entering "0123 456 7890", "Fine" and "Dirwy"
    Then I click the Add button in the phone number tab
    And I enter new phone number entry by selecting description at index 5 and entering "0987 654 321", "Chancery" and "Siawnsri"
    And I click save in the phone number tab
    Then a green message is displayed for updated entries "Phone Numbers updated"
    Then the phone number entry in second last position has description at index 4 number "0123 456 7890" explanation "Fine" and welsh explanation "Dirwy"
    And the phone number entry in last position has description at index 5 number "0987 654 321" explanation "Chancery" and welsh explanation "Siawnsri"

  Scenario: Prevent incomplete entries being added
    When I enter an incomplete phone number entry
    And I click save in the phone number tab
    Then an error message is displayed in the phone number tab

  Scenario: Remove phone number
    When I click the remove button under a phone number entry
    Then I click save in the phone number tab
    Then a green message is displayed for updated entries "Phone Numbers updated"
    # Delete another to remove both entries added above.
    When I click the remove button under a phone number entry
    Then I click save in the phone number tab
    Then a green message is displayed for updated entries "Phone Numbers updated"

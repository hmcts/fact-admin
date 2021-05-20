Feature: Phone Numbers

  Background:
    Given I am on new browser
    Given I am on FACT homepage
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my authenticated credentials
    And click the Sign In button
    Then I can view the courts or tribunals in a list format
    And they are in alphabetical order
    When I click edit next to a chosen court or tribunal
    Then I am redirected to the Edit Court page for the chosen court
    When I click the phone numbers tab
    Then I can view the existing phone numbers

  Scenario Outline: Add new phone numbers
    When I enter new phone number entry by selecting description and entering "<number>", "<explanation>" and "<explanationCy>"
    And I click the Add button in the phone number tab
    And I click save in the phone number tab
    Then a green update message is displayed in the phone numbers tab
    Then the new phone number entry is displayed as expected with number "<number>" explanation "<explanation>" and welsh explanation "<explanationCy>"

    Examples:
      | number         | explanation  | explanationCy |
      | 0123 456 7890  | Fine         | Dirwy         |

  Scenario: Prevent empty entries being added
    When I enter a blank phone number entry
    And I click the Add button in the phone number tab
    And I click save in the phone number tab
    Then an error message is displayed in the phone number tab

  Scenario: Remove phone number
    When I click the remove button under a phone number entry
    Then I click save in the phone number tab
    Then a green update message is displayed in the phone numbers tab

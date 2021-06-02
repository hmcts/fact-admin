Feature: Opening Hours

  Background:
    Given I am on new browser
    Given I am on FACT homepage
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my super user authenticated credentials
    And click the Sign In button
    Then I can view the courts or tribunals in a list format
    When I click edit next to a chosen court or tribunal
    Then I am redirected to the Edit Court page for the chosen court
    When I click the opening hours tab
    Then I can view the existing opening hours

  Scenario Outline: Add new opening hours
    When I enter new opening hours entry by selecting id "<selected_type_id>" and adding text "<hours>"
    And I click the Add button
    And I click save
    Then a green update message is displayed
    Then the new opening time is displayed as expected with id "<selected_type_id>" and text "<hours>"

    # 2 examples are added to ensure we have at least 2 entries for testing re-ordering later in this feature.
    Examples:
      | selected_type_id  | hours             |
      | 44                | 9:00am to 3:30pm  |
      | 49                | 11:00am to 4:00pm |

  Scenario: Reorder opening hours - move entry up
    When I click the move up button on the last opening hours entry which has id "49" and hours "11:00am to 4:00pm"
    Then The opening hours entry with id "49" and hours "11:00am to 4:00pm" is in second last position
    When I click save
    Then a green update message is displayed
    # Check the opening hours entry remains in 2nd last position after saving, which reloads the content
    And The opening hours entry with id "49" and hours "11:00am to 4:00pm" is in second last position

  Scenario: Reorder opening hours - move entry down
    When I click the move down button on the second last opening hours entry which has id "49" and hours "11:00am to 4:00pm"
    Then The opening hours entry with id "49" and hours "11:00am to 4:00pm" is in last position
    When I click save
    Then a green update message is displayed
    # Check the opening hours entry remains in last position after saving, which reloads the content
    And The opening hours entry with id "49" and hours "11:00am to 4:00pm" is in last position

  Scenario: Prevent empty entries being added
    When I enter a blank opening hours entry
    And I click the Add button
    And I click save
    Then an error message is displayed

  Scenario: Remove opening hours
    When I click the remove button under an opening hours entry
    Then I click save
    Then a green update message is displayed
    # Remove a second entry to clean up both additions from scenario above
    When I click the remove button under an opening hours entry
    Then I click save
    Then a green update message is displayed

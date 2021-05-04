Feature: Opening Hours

  Background:
    Given I am on new browser
    Given I am on FACT homepage
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my authenticated credentials "hmcts.super.fact@gmail.com" "Pa55word11"
    And click the Sign In button
    Then I can view the courts or tribunals in a list format
    And they are in alphabetical order
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

    Examples:
      | selected_type_id  | hours            |
      | 44                | 9:00am to 3:30pm |

  Scenario: Prevent empty entries being added
    When I enter a blank opening hours entry
    And I click the Add button
    And I click save
    Then an error message is displayed

  Scenario: Remove opening hours
    When I click the remove button under an opening hours entry
    Then I click save
    Then a green update message is displayed

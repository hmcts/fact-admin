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

  Scenario: Add opening hours
    When I enter new opening hours entry by selecting type at index 4 and adding text "9:00am to 3:30pm"
    Then I click the Add button in the opening hours tab
    And I enter new opening hours entry by selecting type at index 5 and adding text "10:00am to 4:00pm"
    And I click save
    Then a green update message is displayed in the opening hours tab
    Then the second last opening time is displayed as expected with type shown as selected index 4 and hours as "9:00am to 3:30pm"
    And the last opening time is displayed as expected with type shown as selected index 5 and hours as "10:00am to 4:00pm"

  Scenario: Remove opening hours
    When I click the remove button under an opening hours entry
    Then I click save
    Then a green update message is displayed in the opening hours tab
    When I click the remove button under an opening hours entry
    Then I click save
    Then a green update message is displayed in the opening hours tab

  Scenario: Prevent incomplete entries being added
    When I enter an incomplete opening hour description
    And I click save
    Then An error is displayed for opening hours with summary "Description and hours are required for all opening times." and description field message "Description is required"

  Scenario: Prevent duplicated entries being added
    When I enter duplicated opening hour description
    And I click save
    Then An error is displayed for opening hours with summary "All descriptions must be unique." and description field message "Duplicated description"

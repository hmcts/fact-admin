Feature: Email-addresses

  Background:
    Given I am on new browser
    Given I am on FACT homepage
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my super user authenticated credentials
    And click the Sign In button
    Then I can view the courts or tribunals in a list format
    When I click edit next to a chosen court or tribunal
    Then I am redirected to the Edit Court page for the chosen court
    When I click the Emails tab
    Then I can view the existing emails

  Scenario: Add new Email Addresses
    # Clear out potential left-over emails from the previous run before adding new ones
    When I remove all existing email entries and save
    Then a green update message showing email updated is displayed
    When I add Description from the dropdown at index 6 and Address "abs@gmail.com" and Explanation "County Court" and Welsh Explanation "Llys sirol"
    Then I click on Add new Email
    And I add Description from the dropdown at index 8 and Address "functional.test1@testing.com" and Explanation "Testing - English" and Welsh Explanation "Testing - Welsh"
    And I click save button
    Then a green update message showing email updated is displayed
    And the second last email address is displayed with description at index 6 Address "abs@gmail.com" Explanation "County Court" and Welsh Explanation "Llys sirol"
    And the last email address is displayed with description at index 8 Address "functional.test1@testing.com" Explanation "Testing - English" and Welsh Explanation "Testing - Welsh"

  Scenario: Incomplete email type and address
    When I leave adminId blank
    And I add address "incomplete@test.com"
    And I click save button
    Then A red error message display

  Scenario: Remove emails
    When I click the remove button below a email section
    And I click save button
    Then a green update message showing email updated is displayed
    When I click the remove button below a email section
    And I click save button
    Then a green update message showing email updated is displayed

  Scenario: Email format validation
    When I add Description from the dropdown 6 and wrong Email-Address "abcef"
    And I click save button
    Then An error is displayed for email address with summary "Enter an email address in the correct format, like name@example.com" and description field message "Invalid email address format"


  Scenario: Prevent duplicated entries being added
    When I remove all existing email entries and save
    When I add Description from the dropdown 6
    And I enter email address "test@gmail.com"
    And I click on add another button
    And I click on any description 6
    And I enter the same email address "test@gmail.com"
    And I click Save button
    Then An error is displayed for email address with summary "All email addresses must be unique." and description field message "Duplicated address"



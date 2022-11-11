@fact-admin-tab-emails
Feature: Email-addresses

  Background:
    Given I am on new browser
    Given I am on FACT homepage
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my super user authenticated credentials
    And click the Sign In button
    When I click edit next to court with "administrative-court"
    Then I am redirected to the Edit Court page for the chosen court
    When I hover over emails nav element
    Then I click the Emails tab

  Scenario: Add and remove Email Addresses
    When I remove all existing email entries and save
    Then a green update message showing email updated is displayed
    When I add Description from the dropdown at index 6 and Address "abs@gmail.com" and Explanation "County Court" and Welsh Explanation "Llys sirol"
    Then I click on Add new Email
    And I add Description from the dropdown at index 8 and Address "functional.test1@testing.com" and Explanation "Testing - English" and Welsh Explanation "Testing - Welsh"
    And I click save button
    Then a green update message showing email updated is displayed
    And the second last email address is displayed with description at index 6 Address "abs@gmail.com" Explanation "County Court" and Welsh Explanation "Llys sirol"
    And the last email address is displayed with description at index 8 Address "functional.test1@testing.com" Explanation "Testing - English" and Welsh Explanation "Testing - Welsh"
    When I click the remove button below a email section
    And I click save button
    Then a green update message showing email updated is displayed
    When I click the remove button below a email section
    And I click save button
    Then a green update message showing email updated is displayed

  Scenario: Re-order email addresses
    When I remove all existing email entries and save
    Then a green update message showing email updated is displayed
    When I add Description from the dropdown at index 2 and Address "functional.test1@testing.com" and Explanation "Test 1 - English" and Welsh Explanation "Test 1 - Welsh"
    Then I click on Add new Email
    And I add Description from the dropdown at index 3 and Address "functional.test2@testing.com" and Explanation "Test 2 - English" and Welsh Explanation "Test 2 - Welsh"
    And I click save button
    Then the second last email address is displayed with description at index 2 Address "functional.test1@testing.com" Explanation "Test 1 - English" and Welsh Explanation "Test 1 - Welsh"
    And the last email address is displayed with description at index 3 Address "functional.test2@testing.com" Explanation "Test 2 - English" and Welsh Explanation "Test 2 - Welsh"
    When I click the move up button on the last entry
    And I click save button
    Then a green update message showing email updated is displayed
    And the second last email address is displayed with description at index 3 Address "functional.test2@testing.com" Explanation "Test 2 - English" and Welsh Explanation "Test 2 - Welsh"
    And the last email address is displayed with description at index 2 Address "functional.test1@testing.com" Explanation "Test 1 - English" and Welsh Explanation "Test 1 - Welsh"
    When I click the move down button on the second last entry
    And I click save button
    Then a green update message showing email updated is displayed
    Then the second last email address is displayed with description at index 2 Address "functional.test1@testing.com" Explanation "Test 1 - English" and Welsh Explanation "Test 1 - Welsh"
    And the last email address is displayed with description at index 3 Address "functional.test2@testing.com" Explanation "Test 2 - English" and Welsh Explanation "Test 2 - Welsh"

  Scenario: Incomplete email type and address
    When I leave adminId blank
    And I add address "incomplete@test.com"
    And I click save button
    Then A red error message display

  Scenario: Email format validation
    When I add Description from the dropdown 6 and wrong Email-Address "abcef"
    And I click save button
    Then An error is displayed for email address with summary "Enter an email address in the correct format, like name@example.com" and address field message "Invalid email address format"

  Scenario: Prevent duplicated entries being added
    When I remove all existing email entries and save
    When I add Description from the dropdown 6
    And I enter email address "test@gmail.com"
    And I click on add another button
    And I click on any description 6
    And I enter the same email address "test@gmail.com"
    And I click Save button
    Then An error is displayed for email address with summary "All email addresses must be unique." and address field message "Duplicated address"


